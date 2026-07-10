import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateProfile, upgradeToProAction } from './actions';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { upgrade?: string; saved?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('*').eq('id', user!.id).single();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Settings</h1>
        <p className="text-text">Manage your account and subscription.</p>
      </div>

      {searchParams.saved && <p className="font-mono text-xs text-lime">✓ Profile updated.</p>}

      <Card>
        <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-4">Account</p>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Name</label>
            <input
              name="name"
              defaultValue={profile?.name ?? ''}
              className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Email</label>
            <input
              disabled
              defaultValue={profile?.email ?? ''}
              className="w-full bg-surface-2 border border-border-2 px-4 py-3 text-sm text-muted"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">
              GitHub username{' '}
              {profile?.plan !== 'pro' && <span className="text-coral">(social proof sync — Pro)</span>}
            </label>
            <input
              name="github_username"
              defaultValue={profile?.github_username ?? ''}
              placeholder="yourusername"
              className="w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime"
            />
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide">Subscription</p>
          <Badge tone={profile?.plan === 'pro' ? 'lime' : 'muted'}>{profile?.plan ?? 'free'}</Badge>
        </div>

        {profile?.plan === 'pro' ? (
          <p className="text-text-bright text-sm">
            You&apos;re on Pro
            {profile?.plan_expires_at &&
              ` until ${new Date(profile.plan_expires_at).toLocaleDateString()}`}
            . Automated outreach, testimonials, and custom domains are unlocked.
          </p>
        ) : (
          <div>
            <p className="text-text-bright text-sm mb-4">
              Upgrade to Pro for $30/mo — automated outreach, GitHub sync, testimonials, rate
              calculator, custom domain, and unlimited portfolios. Paid in crypto (USDT) via
              NOWPayments.
            </p>
            <form action={upgradeToProAction}>
              <Button type="submit">Upgrade to Pro →</Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
