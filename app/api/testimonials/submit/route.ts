import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatTestimonial } from '@/lib/claude';

export async function POST(request: Request) {
  const { testimonialId, rating, contentRaw } = await request.json();

  if (!testimonialId || !rating || !contentRaw) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: testimonial } = await admin
    .from('testimonials')
    .select('*')
    .eq('id', testimonialId)
    .single();

  if (!testimonial) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (testimonial.content_raw) {
    return NextResponse.json({ error: 'This testimonial was already submitted' }, { status: 409 });
  }

  let formatted = contentRaw;
  try {
    formatted = await formatTestimonial({
      clientName: testimonial.client_name ?? 'A client',
      clientCompany: testimonial.client_company ?? undefined,
      rating,
      contentRaw,
    });
  } catch (err) {
    console.error('Testimonial formatting failed', err);
  }

  const { error } = await admin
    .from('testimonials')
    .update({ rating, content_raw: contentRaw, content_formatted: formatted })
    .eq('id', testimonialId);

  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
