import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PortfolioEditor } from '@/components/portfolio/PortfolioEditor';

export default async function EditPortfolioPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single();

  if (!portfolio) notFound();

  const { data: profile } = await supabase.from('users').select('plan').eq('id', user!.id).single();

  return <PortfolioEditor portfolio={portfolio} plan={profile?.plan ?? 'free'} />;
}
