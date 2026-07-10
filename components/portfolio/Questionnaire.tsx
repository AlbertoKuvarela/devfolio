'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import type { PortfolioProject } from '@/lib/types';

const PERSONALITIES = ['professional, direct', 'friendly, approachable', 'bold, confident', 'technical, precise'];

const emptyProject: PortfolioProject = { title: '', description: '', url: '', tech: [] };

interface FormState {
  name: string;
  stack: string;
  experienceYears: string;
  targetClients: string;
  personality: string;
  bioRaw: string;
  githubUsername: string;
  projects: PortfolioProject[];
}

const TOTAL_STEPS = 10;

export function Questionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    stack: '',
    experienceYears: '',
    targetClients: '',
    personality: PERSONALITIES[0],
    bioRaw: '',
    githubUsername: '',
    projects: [{ ...emptyProject }],
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateProject(index: number, patch: Partial<PortfolioProject>) {
    setForm((f) => {
      const projects = [...f.projects];
      projects[index] = { ...projects[index], ...patch };
      return { ...f, projects };
    });
  }

  function addProject() {
    if (form.projects.length >= 3) return;
    setForm((f) => ({ ...f, projects: [...f.projects, { ...emptyProject }] }));
  }

  const projectStepIndex = step - 8; // steps 8,9,10 => project 0,1,2

  function canAdvance() {
    switch (step) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.stack.trim().length > 0;
      case 3: return form.experienceYears.trim().length > 0;
      case 4: return form.targetClients.trim().length > 0;
      case 5: return form.personality.trim().length > 0;
      case 6: return form.bioRaw.trim().length > 0;
      case 7: return true; // github optional
      case 8: return form.projects[0]?.title.trim().length > 0;
      case 9:
      case 10:
        return true; // extra projects optional
      default: return true;
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const projects = form.projects.filter((p) => p.title.trim().length > 0);

    try {
      const res = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
          experienceYears: Number(form.experienceYears),
          targetClients: form.targetClients,
          personality: form.personality,
          bioRaw: form.bioRaw,
          githubUsername: form.githubUsername || null,
          projects,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong generating your portfolio.');
        setLoading(false);
        return;
      }

      router.push(`/portfolio/${data.portfolio.id}`);
    } catch (err) {
      setError('Network error — please try again.');
      setLoading(false);
    }
  }

  function next() {
    if (step === TOTAL_STEPS) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <div className="font-mono text-[10px] text-lime tracking-widest mb-2">
          STEP {step} / {TOTAL_STEPS}
        </div>
        <div className="h-1 bg-surface-2">
          <div
            className="h-1 bg-lime transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 min-h-[220px]">
        {step === 1 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">What&apos;s your name?</h2>
            <Input
              autoFocus
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Alex Silva"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">What&apos;s your tech stack?</h2>
            <Label>Comma-separated</Label>
            <Input
              autoFocus
              value={form.stack}
              onChange={(e) => update('stack', e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
            />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">Years of experience?</h2>
            <Input
              autoFocus
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => update('experienceYears', e.target.value)}
              placeholder="5"
            />
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">Who are your target clients?</h2>
            <Input
              autoFocus
              value={form.targetClients}
              onChange={(e) => update('targetClients', e.target.value)}
              placeholder="startups, e-commerce"
            />
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">What&apos;s your tone?</h2>
            <div className="space-y-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update('personality', p)}
                  className={`w-full text-left px-4 py-3 text-sm border ${
                    form.personality === p
                      ? 'border-lime text-lime bg-lime-muted'
                      : 'border-border-2 text-text-bright'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">Tell us about yourself</h2>
            <Label>Raw and honest — we&apos;ll turn it into persuasive copy</Label>
            <Textarea
              autoFocus
              rows={5}
              value={form.bioRaw}
              onChange={(e) => update('bioRaw', e.target.value)}
              placeholder="I've spent the last 5 years building..."
            />
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">GitHub username</h2>
            <Label>Optional — powers your social proof engine</Label>
            <Input
              autoFocus
              value={form.githubUsername}
              onChange={(e) => update('githubUsername', e.target.value)}
              placeholder="alexsilva"
            />
          </>
        )}

        {step >= 8 && step <= 10 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">
              Project {projectStepIndex + 1} {projectStepIndex > 0 && <span className="text-muted text-base">(optional)</span>}
            </h2>
            <div className="space-y-3">
              <Input
                autoFocus
                value={form.projects[projectStepIndex]?.title ?? ''}
                onChange={(e) => updateProject(projectStepIndex, { title: e.target.value })}
                placeholder="Project title"
              />
              <Textarea
                rows={3}
                value={form.projects[projectStepIndex]?.description ?? ''}
                onChange={(e) => updateProject(projectStepIndex, { description: e.target.value })}
                placeholder="What did you build, and what impact did it have?"
              />
              <Input
                value={form.projects[projectStepIndex]?.url ?? ''}
                onChange={(e) => updateProject(projectStepIndex, { url: e.target.value })}
                placeholder="https://project-url.com (optional)"
              />
              <Input
                value={form.projects[projectStepIndex]?.tech.join(', ') ?? ''}
                onChange={(e) =>
                  updateProject(projectStepIndex, {
                    tech: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="Tech used: React, Stripe (optional)"
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="text-coral text-sm mt-4">{error}</p>}

      <div className="flex items-center justify-between mt-8">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 1 || loading}>
          ← Back
        </Button>
        <Button type="button" onClick={next} disabled={!canAdvance() || loading}>
          {loading
            ? 'Generating your portfolio…'
            : step === TOTAL_STEPS
              ? 'Generate my portfolio →'
              : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
