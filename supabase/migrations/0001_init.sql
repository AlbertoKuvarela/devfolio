-- DevFolio initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- users
-- Mirrors auth.users (1:1). Row is created by a trigger on signup.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  github_username text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create a public.users row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- portfolios
-- ─────────────────────────────────────────────────────────────
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  slug text unique not null,
  is_published boolean not null default false,
  custom_domain text,
  -- questionnaire data
  stack text[] not null default '{}',
  experience_years int,
  target_clients text,
  personality text,
  bio_raw text,
  projects jsonb not null default '[]',
  -- AI generated copy
  bio_generated text,
  headline_generated text,
  tagline_generated text,
  copy_generated jsonb,
  -- analytics
  views_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_user_id_idx on public.portfolios (user_id);
create index if not exists portfolios_slug_idx on public.portfolios (slug);

alter table public.portfolios enable row level security;

create policy "Owners can manage their portfolios"
  on public.portfolios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Published portfolios are public"
  on public.portfolios for select
  using (is_published = true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- outreach_jobs (Pro)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.outreach_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  portfolio_id uuid references public.portfolios (id) on delete cascade,
  platform text not null check (platform in ('upwork', 'freelancer', 'remoteok')),
  job_id text not null,
  job_title text,
  job_description text,
  job_url text,
  match_score int check (match_score between 0 and 100),
  proposal_generated text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'sent', 'rejected')),
  created_at timestamptz not null default now(),
  unique (platform, job_id, user_id)
);

create index if not exists outreach_jobs_user_id_idx on public.outreach_jobs (user_id);

alter table public.outreach_jobs enable row level security;

create policy "Owners can manage their outreach jobs"
  on public.outreach_jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- testimonials (Pro)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  client_name text,
  client_company text,
  client_email text,
  rating int check (rating between 1 and 5),
  content_raw text,
  content_formatted text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_portfolio_id_idx on public.testimonials (portfolio_id);

alter table public.testimonials enable row level security;

create policy "Owners can manage testimonials on their portfolios"
  on public.testimonials for all
  using (exists (
    select 1 from public.portfolios p
    where p.id = testimonials.portfolio_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolios p
    where p.id = testimonials.portfolio_id and p.user_id = auth.uid()
  ));

create policy "Published testimonials are public"
  on public.testimonials for select
  using (is_published = true);

-- ─────────────────────────────────────────────────────────────
-- analytics
-- ─────────────────────────────────────────────────────────────
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  visitor_ip text,
  referrer text,
  country text,
  page_time_seconds int,
  created_at timestamptz not null default now()
);

create index if not exists analytics_portfolio_id_idx on public.analytics (portfolio_id);

alter table public.analytics enable row level security;

create policy "Owners can view analytics for their portfolios"
  on public.analytics for select
  using (exists (
    select 1 from public.portfolios p
    where p.id = analytics.portfolio_id and p.user_id = auth.uid()
  ));

-- Anyone (including anonymous visitors) can record a pageview for a
-- published portfolio. Inserts only — no read access.
create policy "Anyone can record a pageview"
  on public.analytics for insert
  with check (exists (
    select 1 from public.portfolios p
    where p.id = analytics.portfolio_id and p.is_published = true
  ));
