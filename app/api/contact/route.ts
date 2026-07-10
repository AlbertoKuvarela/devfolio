import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendContactFormEmail } from '@/lib/resend';

export async function POST(request: Request) {
  const { slug, name, email, message } = await request.json();

  if (!slug || !name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: portfolio } = await admin
    .from('portfolios')
    .select('user_id, is_published')
    .eq('slug', slug)
    .single();

  if (!portfolio || !portfolio.is_published) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const { data: owner } = await admin.from('users').select('email').eq('id', portfolio.user_id).single();

  if (!owner?.email) {
    return NextResponse.json({ error: 'Portfolio owner not found' }, { status: 404 });
  }

  await sendContactFormEmail({
    to: owner.email,
    fromName: name,
    fromEmail: email,
    message,
    portfolioSlug: slug,
  });

  return NextResponse.json({ ok: true });
}
