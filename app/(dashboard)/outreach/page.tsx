import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { OutreachJobCard } from '@/components/outreach/OutreachJobCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function OutreachPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('plan').eq('id', user!.id).single();

  if (profile?.plan !== 'pro') {
    return (
      <Card className="max-w-lg text-center py-16">
        <p className="font-mono text-[10px] text-coral tracking-widest uppercase mb-3">Pro feature</p>
        <h1 className="font-display text-2xl font-bold mb-3">Automated outreach</h1>
        <p className="text-text mb-6">
          DevFolio scans RemoteOK, Freelancer and Upwork every 2 hours, scores each opportunity
          against your profile, and drafts a ready-to-send proposal. Upgrade to Pro to turn it on.
        </p>
        <Link href="/settings?upgrade=1">
          <Button>Upgrade to Pro →</Button>
        </Link>
      </Card>
    );
  }

  const { data: jobs } = await supabase
    .from('outreach_jobs')
    .select('*')
    .eq('user_id', user!.id)
    .order('match_score', { ascending: false });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Outreach</h1>
        <p className="text-text mt-1">
          New opportunities are scanned every 2 hours. Review, tweak, and approve with one click.
        </p>
      </div>

      {!jobs?.length ? (
        <Card className="text-center py-16">
          <p className="text-text-bright">No opportunities yet — check back soon.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <OutreachJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
