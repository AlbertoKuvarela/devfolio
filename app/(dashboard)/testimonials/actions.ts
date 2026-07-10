'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// RLS ("Owners can manage testimonials on their portfolios") ensures this
// only affects a row the current user actually owns.
export async function togglePublishTestimonial(testimonialId: string, isPublished: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('testimonials').update({ is_published: isPublished }).eq('id', testimonialId);
  revalidatePath('/testimonials');
}
