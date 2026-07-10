'use client';

import { useState } from 'react';

export function TestimonialForm({ testimonialId }: { testimonialId: string }) {
  const [rating, setRating] = useState(5);
  const [contentRaw, setContentRaw] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);

    const res = await fetch('/api/testimonials/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonialId, rating, contentRaw }),
    });

    if (res.ok) {
      setStatus('sent');
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="font-mono text-sm text-lime">✓ Thank you — your feedback was sent.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label className="block text-xs font-mono text-muted mb-2">How would you rate the work? (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`w-10 h-10 border text-sm ${
                rating === n ? 'border-lime text-lime bg-lime-muted' : 'border-border-2 text-text-bright'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-2">
          What was it like working together, and what impact did the project have?
        </label>
        <textarea
          required
          rows={5}
          value={contentRaw}
          onChange={(e) => setContentRaw(e.target.value)}
          placeholder="Share as much or as little as you'd like — we'll polish it into a short quote."
          className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted"
        />
      </div>

      {errorMsg && <p className="text-coral text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-lime text-black font-bold px-6 py-3 text-sm disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send feedback →'}
      </button>
    </form>
  );
}
