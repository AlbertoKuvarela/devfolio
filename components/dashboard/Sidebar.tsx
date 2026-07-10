'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Plan } from '@/lib/types';

const links = [
  { href: '/dashboard', label: 'Overview', icon: '◧' },
  { href: '/portfolio/new', label: 'New portfolio', icon: '＋' },
  { href: '/outreach', label: 'Outreach', icon: '⌁', pro: true },
  { href: '/testimonials', label: 'Testimonials', icon: '★', pro: true },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface min-h-screen flex flex-col">
      <div className="px-6 py-6">
        <Link href="/" className="font-mono text-lime text-sm">
          dev<span className="text-white">folio</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          const locked = link.pro && plan !== 'pro';
          return (
            <Link
              key={link.href}
              href={locked ? '/settings?upgrade=1' : link.href}
              className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                active ? 'bg-lime-muted text-lime' : 'text-text-bright hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-4 text-center">{link.icon}</span>
                {link.label}
              </span>
              {locked && <span className="text-[9px] font-mono text-coral">PRO</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-border">
        <div className="text-[10px] font-mono text-muted mb-3 uppercase tracking-wide">
          Plan: <span className={plan === 'pro' ? 'text-lime' : 'text-text-bright'}>{plan}</span>
        </div>
        <button onClick={handleLogout} className="text-xs font-mono text-muted hover:text-coral">
          Log out
        </button>
      </div>
    </aside>
  );
}
