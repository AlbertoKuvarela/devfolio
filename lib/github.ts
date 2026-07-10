const GITHUB_API = 'https://api.github.com';

function headers() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface GithubRepoSummary {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  pushedAt: string;
}

export interface GithubProfileSummary {
  username: string;
  publicRepos: number;
  followers: number;
  topRepos: GithubRepoSummary[];
}

// Powers the "social proof engine" — pulls fresh public activity for a
// developer's portfolio without requiring them to update anything manually.
export async function fetchGithubProfile(username: string): Promise<GithubProfileSummary> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, { headers: headers(), next: { revalidate: 3600 } }),
    fetch(`${GITHUB_API}/users/${username}/repos?sort=pushed&per_page=6`, {
      headers: headers(),
      next: { revalidate: 3600 },
    }),
  ]);

  if (!userRes.ok) throw new Error(`GitHub user lookup failed: ${userRes.status}`);
  if (!reposRes.ok) throw new Error(`GitHub repos lookup failed: ${reposRes.status}`);

  const user = await userRes.json();
  const repos = await reposRes.json();

  return {
    username: user.login,
    publicRepos: user.public_repos,
    followers: user.followers,
    topRepos: (repos as any[])
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        pushedAt: r.pushed_at,
      })),
  };
}
