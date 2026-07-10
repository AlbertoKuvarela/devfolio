'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import type { DbPortfolio } from '@/lib/types';

export function RequestTestimonialForm({ portfolios }: { portfolios: DbPortfolio[] }) {
  const router = useRouter();
  const [portfolioId, setPortfolioId] = useState(portfolios[0]?.id ?? '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/testimonials/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId, clientName, clientEmail, clientCompany }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? 'Something went wrong.');
      return;
    }

    setClientName('');
    setClientEmail('');
    setClientCompany('');
    setMessage('Request sent!');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {portfolios.length > 1 && (
        <div>
          <Label>Portfolio</Label>
          <select
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
            className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime"
          >
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.slug}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <Label>Client name</Label>
        <Input required value={clientName} onChange={(e) => setClientName(e.target.value)} />
      </div>
      <div>
        <Label>Client email</Label>
        <Input required type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
      </div>
      <div>
        <Label>Company (optional)</Label>
        <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading || !portfolioId}>
        {loading ? 'Sending…' : 'Send request →'}
      </Button>
      {message && <p className="font-mono text-xs text-text-bright">{message}</p>}
    </form>
  );
}
