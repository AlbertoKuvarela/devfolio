import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('users').select('*').eq('id', user!.id).single();
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const totalViews = (portfolios ?? []).reduce((sum, p) => sum + (p.views_count ?? 0), 0);
  const canCreateMore = profile?.plan === 'pro' || (portfolios?.length ?? 0) === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-text mt-1">Here&apos;s how your portfolios are performing.</p>
        </div>
        {canCreateMore && (
          <Link href="/portfolio/new">
            <Button>+ New portfolio</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <Card>
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-3">Portfolios</p>
          <p className="font-display text-4xl font-extrabold">{portfolios?.length ?? 0}</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-3">Total views</p>
          <p className="font-display text-4xl font-extrabold">{totalViews}</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-3">Plan</p>
          <p className="font-display text-4xl font-extrabold capitalize">{profile?.plan ?? 'free'}</p>
        </Card>
      </div>

      {!portfolios?.length ? (
        <Card className="text-center py-16">
          <p className="text-text-bright mb-4">You haven&apos;t created a portfolio yet.</p>
          <Link href="/portfolio/new">
            <Button>Generate my portfolio →</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {portfolios.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-display font-bold">{p.headline_generated || p.slug}</h3>
                  <Badge tone={p.is_published ? 'lime' : 'muted'}>
                    {p.is_published ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <p className="font-mono text-[11px] text-muted">
                  {p.slug}.devfolio.io · {p.views_count} views
                </p>
              </div>
              <div className="flex gap-2">
                <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary">View</Button>
                </a>
                <Link href={`/portfolio/${p.id}`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {profile?.plan === 'free' && (
        <Card className="mt-10 flex items-center justify-between">
          <div>
            <p className="font-display font-bold mb-1">Ready for clients to find you automatically?</p>
            <p className="text-text text-sm">
              Upgrade to Pro for automated outreach, testimonials, and unlimited portfolios.
            </p>
          </div>
          <Link href="/settings?upgrade=1">
            <Button>Upgrade to Pro</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
