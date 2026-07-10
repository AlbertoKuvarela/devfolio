import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTestimonialRequestEmail } from '@/lib/resend';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('plan, name').eq('id', user.id).single();
  if (profile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Testimonials are a Pro feature' }, { status: 403 });
  }

  const { portfolioId, clientName, clientEmail, clientCompany } = await request.json();

  if (!portfolioId || !clientName || !clientEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id')
    .eq('id', portfolioId)
    .eq('user_id', user.id)
    .single();

  if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .insert({
      portfolio_id: portfolioId,
      client_name: clientName,
      client_email: clientEmail,
      client_company: clientCompany ?? null,
      is_published: false,
    })
    .select()
    .single();

  if (error || !testimonial) {
    return NextResponse.json({ error: 'Failed to create testimonial request' }, { status: 500 });
  }

  await sendTestimonialRequestEmail({
    to: clientEmail,
    clientName,
    developerName: profile?.name ?? 'your developer',
    formUrl: `${process.env.NEXT_PUBLIC_APP_URL}/t/${testimonial.id}`,
  });

  return NextResponse.json({ testimonial });
}
