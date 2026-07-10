import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ContactForm } from '@/components/portfolio/ContactForm';
import { AnalyticsTracker } from '@/components/portfolio/AnalyticsTracker';
import { fetchGithubProfile } from '@/lib/github';

export const revalidate = 0;

async function getPortfolio(slug: string) {
  const supabase = createClient();
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  return portfolio;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug);
  if (!portfolio) return { title: 'Portfolio not found — DevFolio' };

  return {
    title: `${portfolio.headline_generated ?? params.slug} — DevFolio`,
    description: portfolio.tagline_generated ?? portfolio.bio_generated ?? undefined,
  };
}

export default async function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const portfolio = await getPortfolio(params.slug);
  if (!portfolio) notFound();

  const admin = createAdminClient();
  admin
    .from('portfolios')
    .update({ views_count: portfolio.views_count + 1 })
    .eq('id', portfolio.id)
    .then(() => {});

  const { data: owner } = await admin
    .from('users')
    .select('plan, github_username')
    .eq('id', portfolio.user_id)
    .single();
  const showBranding = owner?.plan !== 'pro';

  const githubProfile =
    owner?.plan === 'pro' && owner.github_username
      ? await fetchGithubProfile(owner.github_username).catch(() => null)
      : null;

  const { data: testimonials } = await admin
    .from('testimonials')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-bg text-white">
      <AnalyticsTracker portfolioId={portfolio.id} />

      <main className="max-w-2xl mx-auto px-6 py-20">
        <p className="font-mono text-[10px] text-lime tracking-widest uppercase mb-6">
          {portfolio.target_clients ? `Available for ${portfolio.target_clients}` : 'Available for work'}
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          {portfolio.headline_generated}
        </h1>

        <p className="text-text-bright text-lg mb-10 leading-relaxed">{portfolio.tagline_generated}</p>

        <p className="text-text-bright leading-relaxed mb-14 whitespace-pre-line">
          {portfolio.bio_generated}
        </p>

        {portfolio.stack?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-14">
            {portfolio.stack.map((tech: string) => (
              <span
                key={tech}
                className="font-mono text-[11px] px-2.5 py-1 bg-surface border border-border-2 text-text-bright"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {portfolio.copy_generated?.projects && portfolio.copy_generated.projects.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-xl font-bold mb-6">Selected work</h2>
            <div className="space-y-8">
              {portfolio.copy_generated.projects.map((project: { title: string; description: string }, i: number) => {
                const raw = portfolio.projects?.[i];
                return (
                  <div key={i} className="border-l-2 border-border-2 pl-5">
                    <h3 className="font-display font-bold text-base mb-1.5">
                      {raw?.url ? (
                        <a href={raw.url} target="_blank" rel="noreferrer" className="hover:text-lime">
                          {project.title}
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <p className="text-text text-sm leading-relaxed">{project.description}</p>
                    {raw?.tech?.length > 0 && (
                      <p className="font-mono text-[10px] text-muted mt-2">{raw.tech.join(' · ')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {githubProfile && (
          <section className="mb-14">
            <h2 className="font-display text-xl font-bold mb-6">Recent activity</h2>
            <p className="font-mono text-[11px] text-muted mb-4">
              @{githubProfile.username} · {githubProfile.publicRepos} public repos · {githubProfile.followers} followers
            </p>
            <div className="space-y-3">
              {githubProfile.topRepos.slice(0, 4).map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border border-border-2 bg-surface px-4 py-3 hover:border-lime"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-bright">{repo.name}</span>
                    <span className="font-mono text-[10px] text-muted">★ {repo.stars}</span>
                  </div>
                  {repo.description && <p className="text-text text-xs mt-1">{repo.description}</p>}
                </a>
              ))}
            </div>
          </section>
        )}

        {testimonials?.length ? (
          <section className="mb-14">
            <h2 className="font-display text-xl font-bold mb-6">What clients say</h2>
            <div className="space-y-6">
              {testimonials.map((t) => (
                <div key={t.id} className="border-l-2 border-lime pl-5">
                  <p className="text-text-bright text-sm leading-relaxed mb-2">{t.content_formatted}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {t.client_name}
                    {t.client_company && ` · ${t.client_company}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-14">
          <h2 className="font-display text-xl font-bold mb-6">Get in touch</h2>
          <ContactForm slug={portfolio.slug} />
        </section>

        {showBranding && (
          <footer className="pt-10 border-t border-border font-mono text-[10px] text-muted">
            Built with <span className="text-lime">DevFolio</span>
          </footer>
        )}
      </main>
    </div>
  );
}
