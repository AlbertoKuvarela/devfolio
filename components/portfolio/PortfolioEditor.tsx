'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import type { DbPortfolio, Plan } from '@/lib/types';

export function PortfolioEditor({ portfolio, plan }: { portfolio: DbPortfolio; plan: Plan }) {
  const router = useRouter();
  const [form, setForm] = useState({
    stack: portfolio.stack.join(', '),
    experience_years: String(portfolio.experience_years ?? ''),
    target_clients: portfolio.target_clients ?? '',
    personality: portfolio.personality ?? '',
    bio_raw: portfolio.bio_raw ?? '',
    custom_domain: portfolio.custom_domain ?? '',
  });
  const [isPublished, setIsPublished] = useState(portfolio.is_published);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publicUrl = `${portfolio.slug}.devfolio.io`;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/portfolio/${portfolio.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    await patch({
      stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
      experience_years: Number(form.experience_years) || null,
      target_clients: form.target_clients,
      personality: form.personality,
      bio_raw: form.bio_raw,
      ...(plan === 'pro' ? { custom_domain: form.custom_domain || null } : {}),
    });
    setSaving(false);
    setMessage('Saved.');
    router.refresh();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setMessage(null);
    const data = await patch({ action: 'regenerate' });
    setRegenerating(false);
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage('Portfolio copy regenerated.');
      router.refresh();
    }
  }

  async function togglePublish() {
    const next = !isPublished;
    setIsPublished(next);
    await patch({ is_published: next });
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-display text-2xl font-extrabold">{portfolio.headline_generated}</h1>
            <Badge tone={isPublished ? 'lime' : 'muted'}>{isPublished ? 'Live' : 'Draft'}</Badge>
          </div>
          <a
            href={`/${portfolio.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-lime"
          >
            {publicUrl} ↗
          </a>
        </div>
        <Button variant="secondary" onClick={togglePublish}>
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
      </div>

      <Card className="mb-6">
        <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-3">Generated copy</p>
        <p className="text-text-bright mb-2">{portfolio.tagline_generated}</p>
        <p className="text-text text-sm leading-relaxed">{portfolio.bio_generated}</p>
        <Button variant="secondary" className="mt-4" onClick={handleRegenerate} disabled={regenerating}>
          {regenerating ? 'Regenerating…' : '↻ Regenerate with AI'}
        </Button>
      </Card>

      <Card className="space-y-4">
        <p className="font-mono text-[10px] text-muted uppercase tracking-wide">Questionnaire data</p>

        <div>
          <Label>Stack</Label>
          <Input value={form.stack} onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))} />
        </div>
        <div>
          <Label>Years of experience</Label>
          <Input
            type="number"
            value={form.experience_years}
            onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))}
          />
        </div>
        <div>
          <Label>Target clients</Label>
          <Input
            value={form.target_clients}
            onChange={(e) => setForm((f) => ({ ...f, target_clients: e.target.value }))}
          />
        </div>
        <div>
          <Label>Personality</Label>
          <Input
            value={form.personality}
            onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))}
          />
        </div>
        <div>
          <Label>Raw bio</Label>
          <Textarea
            rows={4}
            value={form.bio_raw}
            onChange={(e) => setForm((f) => ({ ...f, bio_raw: e.target.value }))}
          />
        </div>

        {plan === 'pro' ? (
          <div>
            <Label>Custom domain</Label>
            <Input
              value={form.custom_domain}
              onChange={(e) => setForm((f) => ({ ...f, custom_domain: e.target.value }))}
              placeholder="www.yourname.com"
            />
          </div>
        ) : (
          <div>
            <Label>Custom domain</Label>
            <p className="font-mono text-xs text-coral">Upgrade to Pro to use a custom domain.</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {message && <span className="font-mono text-xs text-text-bright">{message}</span>}
        </div>
      </Card>
    </div>
  );
}
