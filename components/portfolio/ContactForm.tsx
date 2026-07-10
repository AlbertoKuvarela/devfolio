'use client';

import { useState } from 'react';

export function ContactForm({ slug }: { slug: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, email, message }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="font-mono text-sm text-lime">✓ Message sent — you&apos;ll hear back soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted"
      />
      <input
        required
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted"
      />
      <textarea
        required
        rows={4}
        placeholder="What do you need built?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-lime text-black font-bold px-6 py-3 text-sm disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </button>
      {status === 'error' && <p className="text-coral text-sm">Something went wrong — try again.</p>}
    </form>
  );
}
