'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setOutreachStatus(jobId: string, status: 'approved' | 'sent' | 'rejected') {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('outreach_jobs').update({ status }).eq('id', jobId).eq('user_id', user.id);
  revalidatePath('/outreach');
}
