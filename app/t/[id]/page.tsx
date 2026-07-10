import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { TestimonialForm } from '@/components/testimonials/TestimonialForm';

export default async function TestimonialRequestPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data: testimonial } = await admin.from('testimonials').select('*').eq('id', params.id).single();

  if (!testimonial) notFound();

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        <p className="font-mono text-[10px] text-lime tracking-widest uppercase mb-3">Quick feedback</p>
        <h1 className="font-display text-2xl font-bold mb-6">
          Hi {testimonial.client_name}, got a minute?
        </h1>
        {testimonial.content_raw ? (
          <p className="font-mono text-sm text-lime">✓ You&apos;ve already submitted your feedback — thank you!</p>
        ) : (
          <TestimonialForm testimonialId={testimonial.id} />
        )}
      </div>
    </div>
  );
}
