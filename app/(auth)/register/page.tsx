'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push('/portfolio/new');
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="font-mono text-sm text-text-bright">
        <p className="text-lime mb-2">{'// check your inbox'}</p>
        <p>We sent a confirmation link to {email}. Click it to activate your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold mb-6 tracking-tight">
        Create your account
      </h1>

      <div>
        <label className="block text-xs font-mono text-muted mb-2">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-border-2 px-4 py-3 text-sm outline-none focus:border-lime"
          placeholder="Alex Silva"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-2">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border-2 px-4 py-3 text-sm outline-none focus:border-lime"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted mb-2">Password</label>
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-border-2 px-4 py-3 text-sm outline-none focus:border-lime"
          placeholder="At least 8 characters"
        />
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime text-black font-bold py-3 text-sm disabled:opacity-60"
      >
        {loading ? 'Creating account…' : 'Get Started Free →'}
      </button>

      <p className="text-xs text-muted font-mono">
        Already have an account?{' '}
        <Link href="/login" className="text-lime">
          Log in
        </Link>
      </p>
    </form>
  );
}
