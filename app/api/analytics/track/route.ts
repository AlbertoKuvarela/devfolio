import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { portfolioId, referrer, country, pageTimeSeconds } = await request.json();

  if (!portfolioId) {
    return NextResponse.json({ error: 'Missing portfolioId' }, { status: 400 });
  }

  const admin = createAdminClient();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  await admin.from('analytics').insert({
    portfolio_id: portfolioId,
    visitor_ip: ip,
    referrer: referrer ?? null,
    country: country ?? null,
    page_time_seconds: pageTimeSeconds ?? null,
  });

  return NextResponse.json({ ok: true });
}
