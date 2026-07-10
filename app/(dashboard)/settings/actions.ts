'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createProSubscriptionInvoice } from '@/lib/nowpayments';

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = String(formData.get('name') ?? '');
  const githubUsername = String(formData.get('github_username') ?? '') || null;

  await supabase.from('users').update({ name, github_username: githubUsername }).eq('id', user.id);
  redirect('/settings?saved=1');
}

export async function upgradeToProAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const invoice = await createProSubscriptionInvoice({ userId: user.id, priceAmount: 30 });
  redirect(invoice.invoice_url);
}
