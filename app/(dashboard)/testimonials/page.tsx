import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RequestTestimonialForm } from '@/components/testimonials/RequestTestimonialForm';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
import Link from 'next/link';

export default async function TestimonialsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('plan').eq('id', user!.id).single();

  if (profile?.plan !== 'pro') {
    return (
      <Card className="max-w-lg text-center py-16">
        <p className="font-mono text-[10px] text-coral tracking-widest uppercase mb-3">Pro feature</p>
        <h1 className="font-display text-2xl font-bold mb-3">Testimonial generator</h1>
        <p className="text-text mb-6">
          Send clients a short feedback form and DevFolio turns their answer into a polished
          testimonial, published straight to your portfolio. Upgrade to Pro to turn it on.
        </p>
        <Link href="/settings?upgrade=1">
          <Button>Upgrade to Pro →</Button>
        </Link>
      </Card>
    );
  }

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const portfolioIds = (portfolios ?? []).map((p) => p.id);
  const { data: testimonials } = portfolioIds.length
    ? await supabase
        .from('testimonials')
        .select('*')
        .in('portfolio_id', portfolioIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Testimonials</h1>
        <p className="text-text mt-1">Request feedback and publish polished testimonials automatically.</p>
      </div>

      <Card className="mb-8">
        <p className="font-mono text-[10px] text-muted uppercase tracking-wide mb-4">Request a testimonial</p>
        {portfolios?.length ? (
          <RequestTestimonialForm portfolios={portfolios} />
        ) : (
          <p className="text-text text-sm">Create a portfolio first.</p>
        )}
      </Card>

      {!testimonials?.length ? (
        <Card className="text-center py-16">
          <p className="text-text-bright">No testimonial requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}
    </div>
  );
}
