import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRemoteOkJobs } from '@/lib/remoteok';
import { calculateMatchScore, generateProposal } from '@/lib/claude';
import { sendOutreachOpportunityEmail } from '@/lib/resend';

const MATCH_THRESHOLD = 70;
const MAX_JOBS_PER_SCAN = 20;

function isRoughMatch(stack: string[], job: { tags: string[]; position: string; description: string }) {
  const haystack = `${job.position} ${job.description} ${job.tags.join(' ')}`.toLowerCase();
  return stack.some((tech) => haystack.includes(tech.toLowerCase()));
}

// Triggered once a day by Vercel Cron (see vercel.json). Scans RemoteOK
// for openings that match each Pro user's stack, scores them with Claude,
// and drafts a proposal for anything above the match threshold.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: proUsers } = await admin.from('users').select('*').eq('plan', 'pro');
  if (!proUsers?.length) return NextResponse.json({ ok: true, scanned: 0 });

  const jobs = await fetchRemoteOkJobs('dev');
  let created = 0;

  for (const user of proUsers) {
    const { data: portfolio } = await admin
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!portfolio?.copy_generated) continue;

    const candidates = jobs.filter((job) => isRoughMatch(portfolio.stack, job)).slice(0, MAX_JOBS_PER_SCAN);

    for (const job of candidates) {
      const { data: existing } = await admin
        .from('outreach_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'remoteok')
        .eq('job_id', job.id)
        .maybeSingle();

      if (existing) continue;

      let score: number;
      try {
        score = await calculateMatchScore({
          portfolioCopy: portfolio.copy_generated,
          stack: portfolio.stack,
          jobTitle: job.position,
          jobDescription: job.description,
        });
      } catch (err) {
        console.error('Match score failed', err);
        continue;
      }

      if (score < MATCH_THRESHOLD) continue;

      let proposal = '';
      try {
        proposal = await generateProposal({
          developerName: user.name ?? 'there',
          portfolioCopy: portfolio.copy_generated,
          jobTitle: job.position,
          jobDescription: job.description,
        });
      } catch (err) {
        console.error('Proposal generation failed', err);
      }

      const { error: insertError } = await admin.from('outreach_jobs').insert({
        user_id: user.id,
        portfolio_id: portfolio.id,
        platform: 'remoteok',
        job_id: job.id,
        job_title: job.position,
        job_description: job.description,
        job_url: job.url,
        match_score: score,
        proposal_generated: proposal,
        status: 'pending',
      });

      if (insertError) {
        console.error('Failed to insert outreach job', insertError);
        continue;
      }

      created += 1;

      try {
        await sendOutreachOpportunityEmail({
          to: user.email,
          developerName: user.name ?? 'there',
          jobTitle: job.position,
          matchScore: score,
          reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/outreach`,
        });
      } catch (err) {
        console.error('Failed to send outreach notification', err);
      }
    }
  }

  return NextResponse.json({ ok: true, scanned: proUsers.length, created });
}
