import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('plan').eq('id', user.id).single();

  return (
    <div className="min-h-screen bg-bg text-white flex">
      <Sidebar plan={profile?.plan ?? 'free'} />
      <main className="flex-1 px-10 py-10 max-w-5xl">{children}</main>
    </div>
  );
}
