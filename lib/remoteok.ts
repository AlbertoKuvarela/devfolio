export interface RemoteOkJob {
  id: string;
  position: string;
  description: string;
  url: string;
  tags: string[];
}

// RemoteOK's public JSON feed. The first element is metadata, not a job.
export async function fetchRemoteOkJobs(tag = 'dev'): Promise<RemoteOkJob[]> {
  const res = await fetch(`https://remoteok.io/api?tag=${encodeURIComponent(tag)}`, {
    headers: { 'User-Agent': 'DevFolio/1.0 (+https://devfolio.io)' },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`RemoteOK request failed: ${res.status}`);

  const data = await res.json();
  return (data as any[])
    .filter((item) => item && item.id && item.position)
    .map((item) => ({
      id: String(item.id),
      position: item.position,
      description: (item.description ?? '').replace(/<[^>]+>/g, ' ').slice(0, 4000),
      url: item.url ?? `https://remoteok.io/remote-jobs/${item.id}`,
      tags: item.tags ?? [],
    }));
}
