# DevFolio

DevFolio is a micro-SaaS client-acquisition engine for freelance developers. It's not just a
portfolio generator — it builds a persuasive, AI-written portfolio in minutes, then (on the Pro
plan) hunts for freelance opportunities, drafts personalised proposals, and keeps your profile
alive with GitHub activity and client testimonials.

## Stack

- **Frontend + Backend:** Next.js 14 (App Router)
- **Database + Auth:** Supabase (Postgres + RLS)
- **AI:** Claude API (Anthropic)
- **Payments:** NOWPayments (crypto, settled in USDT)
- **Hosting:** Vercel
- **Email:** Resend

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** and run the migration in `supabase/migrations/0001_init.sql`
   (paste it into the Supabase SQL editor, or `supabase db push` if you use the CLI). It creates
   the `users`, `portfolios`, `outreach_jobs`, `testimonials`, and `analytics` tables with Row
   Level Security enabled, plus a trigger that mirrors `auth.users` into `public.users` on signup.

3. **Copy `.env.example` to `.env.local`** and fill in:

   | Variable | Where to get it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API (server-only, never expose to the client) |
   | `ANTHROPIC_API_KEY` | console.anthropic.com |
   | `NOWPAYMENTS_API_KEY` / `NOWPAYMENTS_IPN_SECRET` | nowpayments.io dashboard |
   | `RESEND_API_KEY` | resend.com dashboard |
   | `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens (used server-side for the social proof engine's rate limits) |
   | `CRON_SECRET` | any random string — set the same value in Vercel's Cron protection settings |

4. **Run the dev server**

   ```bash
   npm run dev
   ```

## Architecture

```
/app
  page.tsx                     landing page
  (auth)/login, /register      Supabase Auth
  (dashboard)/dashboard        portfolio overview + stats
  (dashboard)/portfolio/new    10-step questionnaire → AI generation
  (dashboard)/portfolio/[id]   edit + regenerate copy, publish toggle
  (dashboard)/outreach         Pro: review/approve AI-drafted proposals
  (dashboard)/testimonials     Pro: request + publish client testimonials
  (dashboard)/settings         account, GitHub sync, Pro upgrade
  [slug]                       public portfolio (fast, mostly server-rendered)
  t/[id]                       public testimonial request form (client-facing)
  api/generate-portfolio       Claude portfolio copy generation
  api/portfolio/[id]           edit/regenerate/delete a portfolio
  api/outreach/scan            cron: scans RemoteOK, scores + drafts proposals
  api/testimonials/send        sends the client feedback request
  api/testimonials/submit      client's feedback → AI-polished testimonial
  api/payments/webhook         NOWPayments IPN → upgrades plan to Pro
  api/contact                  public portfolio's contact form → email
  api/analytics/track          pageview + time-on-page tracking

/components
  portfolio/   outreach/   testimonials/   dashboard/   ui/

/lib
  supabase/{client,server,admin,middleware}.ts
  claude.ts        nowpayments.ts        github.ts        resend.ts
  remoteok.ts       slug.ts               types.ts
```

## Plans

- **Free ($0):** 1 AI-generated portfolio, `slug.devfolio.io` subdomain, contact form, basic
  analytics.
- **Pro ($30/mo):** unlimited portfolios, automated outreach (RemoteOK live; Freelancer/Upwork
  require their OAuth app approval — client IDs are wired up in `.env.example`, add the actual
  API calls to `lib/` once approved), AI proposal generation, GitHub social proof sync,
  testimonial generator, custom domain, advanced analytics, no DevFolio branding.

## Notes

- Row Level Security is enabled on every table; the service-role client (`lib/supabase/admin.ts`)
  is only used server-side for cron jobs, webhooks, and public read paths that need to bypass a
  user-scoped policy (e.g. incrementing view counts on someone else's published portfolio).
- The outreach cron (`vercel.json`) hits `/api/outreach/scan` every 2 hours; protect it in Vercel
  project settings with the same `CRON_SECRET` value.
