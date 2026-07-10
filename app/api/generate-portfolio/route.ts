import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePortfolioCopy } from '@/lib/claude';
import { slugify } from '@/lib/slug';
import type { PortfolioProject } from '@/lib/types';

interface RequestBody {
  name: string;
  stack: string[];
  experienceYears: number;
  targetClients: string;
  personality: string;
  bioRaw: string;
  githubUsername: string | null;
  projects: PortfolioProject[];
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = (await request.json()) as RequestBody;

  if (!body.name || !body.stack?.length || !body.bioRaw) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: profile } = await supabase.from('users').select('plan').eq('id', user.id).single();
  const plan = profile?.plan ?? 'free';

  if (plan === 'free') {
    const { count } = await supabase
      .from('portfolios')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: 'Free plan is limited to 1 portfolio. Upgrade to Pro for unlimited portfolios.' },
        { status: 403 }
      );
    }
  }

  if (body.githubUsername) {
    await supabase.from('users').update({ github_username: body.githubUsername }).eq('id', user.id);
  }

  let copy;
  try {
    copy = await generatePortfolioCopy({
      name: body.name,
      stack: body.stack,
      experienceYears: body.experienceYears,
      targetClients: body.targetClients,
      personality: body.personality,
      projects: body.projects,
      bioRaw: body.bioRaw,
    });
  } catch (err) {
    console.error('Claude generation failed', err);
    return NextResponse.json({ error: 'Failed to generate portfolio copy' }, { status: 502 });
  }

  const baseSlug = slugify(body.name) || 'developer';
  let slug = baseSlug;
  for (let i = 1; i < 50; i++) {
    const { data: existing } = await supabase.from('portfolios').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data: portfolio, error: insertError } = await supabase
    .from('portfolios')
    .insert({
      user_id: user.id,
      slug,
      is_published: true,
      stack: body.stack,
      experience_years: body.experienceYears,
      target_clients: body.targetClients,
      personality: body.personality,
      bio_raw: body.bioRaw,
      projects: body.projects,
      bio_generated: copy.bio,
      headline_generated: copy.headline,
      tagline_generated: copy.tagline,
      copy_generated: copy,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Portfolio insert failed', insertError);
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 });
  }

  return NextResponse.json({ portfolio });
}
