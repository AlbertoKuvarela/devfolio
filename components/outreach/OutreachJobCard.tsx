'use client';

import { useTransition } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { setOutreachStatus } from '@/app/(dashboard)/outreach/actions';
import type { DbOutreachJob } from '@/lib/types';

const statusTone = {
  pending: 'muted',
  approved: 'lime',
  sent: 'lime',
  rejected: 'coral',
} as const;

export function OutreachJobCard({ job }: { job: DbOutreachJob }) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: 'approved' | 'sent' | 'rejected') {
    startTransition(() => setOutreachStatus(job.id, status));
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold">{job.job_title}</h3>
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide mt-1">
            {job.platform} · {job.match_score}% match
          </p>
        </div>
        <Badge tone={statusTone[job.status]}>{job.status}</Badge>
      </div>

      {job.proposal_generated && (
        <div className="bg-bg border border-border-2 px-4 py-3 mb-4">
          <p className="font-mono text-[9px] text-lime tracking-wide mb-2">AI_GENERATED_PROPOSAL</p>
          <p className="text-text-bright text-sm leading-relaxed whitespace-pre-line">
            {job.proposal_generated}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noreferrer">
            <Button variant="secondary" disabled={isPending}>
              View job ↗
            </Button>
          </a>
        )}
        {job.status === 'pending' && (
          <>
            <Button onClick={() => setStatus('approved')} disabled={isPending}>
              Approve →
            </Button>
            <Button variant="ghost" onClick={() => setStatus('rejected')} disabled={isPending}>
              Reject
            </Button>
          </>
        )}
        {job.status === 'approved' && (
          <Button onClick={() => setStatus('sent')} disabled={isPending}>
            Mark as sent
          </Button>
        )}
      </div>
    </Card>
  );
}
