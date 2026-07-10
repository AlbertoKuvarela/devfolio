import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePortfolioCopy } from '@/lib/claude';
import type { DbPortfolio } from '@/lib/types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

  const body = await request.json();

  if (body.action === 'regenerate') {
    const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single();

    let copy;
    try {
      copy = await generatePortfolioCopy({
        name: profile?.name ?? portfolio.slug,
        stack: portfolio.stack,
        experienceYears: portfolio.experience_years ?? 0,
        targetClients: portfolio.target_clients ?? '',
        personality: portfolio.personality ?? '',
        projects: portfolio.projects,
        bioRaw: portfolio.bio_raw ?? '',
      });
    } catch (err) {
      console.error('Regeneration failed', err);
      return NextResponse.json({ error: 'Failed to regenerate copy' }, { status: 502 });
    }

    const { data: updated, error } = await supabase
      .from('portfolios')
      .update({
        bio_generated: copy.bio,
        headline_generated: copy.headline,
        tagline_generated: copy.tagline,
        copy_generated: copy,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    return NextResponse.json({ portfolio: updated });
  }

  const allowedFields = [
    'is_published',
    'custom_domain',
    'stack',
    'experience_years',
    'target_clients',
    'personality',
    'bio_raw',
    'projects',
  ] as const satisfies readonly (keyof DbPortfolio)[];

  const patch: Partial<DbPortfolio> = {};
  for (const field of allowedFields) {
    if (field in body) patch[field] = body[field];
  }

  const { data: updated, error } = await supabase
    .from('portfolios')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  return NextResponse.json({ portfolio: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { error } = await supabase.from('portfolios').delete().eq('id', params.id).eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
