'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(searchParams.get('redirect') || '/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold mb-6 tracking-tight">Log in</h1>

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
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-border-2 px-4 py-3 text-sm outline-none focus:border-lime"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime text-black font-bold py-3 text-sm disabled:opacity-60"
      >
        {loading ? 'Logging in…' : 'Log in →'}
      </button>

      <p className="text-xs text-muted font-mono">
        No account yet?{' '}
        <Link href="/register" className="text-lime">
          Get started free
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
