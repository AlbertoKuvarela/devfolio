'use client';

import { useTransition } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { togglePublishTestimonial } from '@/app/(dashboard)/testimonials/actions';
import type { DbTestimonial } from '@/lib/types';

export function TestimonialCard({ testimonial }: { testimonial: DbTestimonial }) {
  const [isPending, startTransition] = useTransition();
  const submitted = Boolean(testimonial.content_raw);

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold">
            {testimonial.client_name}
            {testimonial.client_company && (
              <span className="text-text font-normal"> · {testimonial.client_company}</span>
            )}
          </h3>
          {testimonial.rating && (
            <p className="font-mono text-[10px] text-muted mt-1">{'★'.repeat(testimonial.rating)}</p>
          )}
        </div>
        <Badge tone={!submitted ? 'muted' : testimonial.is_published ? 'lime' : 'muted'}>
          {!submitted ? 'awaiting response' : testimonial.is_published ? 'published' : 'unpublished'}
        </Badge>
      </div>

      {submitted ? (
        <p className="text-text-bright text-sm leading-relaxed mb-4">{testimonial.content_formatted}</p>
      ) : (
        <p className="text-text text-sm mb-4">Request sent — waiting for the client to respond.</p>
      )}

      {submitted && (
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(() => togglePublishTestimonial(testimonial.id, !testimonial.is_published))
          }
        >
          {testimonial.is_published ? 'Unpublish' : 'Publish on portfolio'}
        </Button>
      )}
    </Card>
  );
}
