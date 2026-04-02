import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import ContainerQuoteForm from '@/components/quotes/ContainerQuoteForm';
import { DEFAULT_RATES, DEFAULT_COMPANY } from '@/types/settings';

export default async function ContainerQuotePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [{ data: rates }, { data: company }] = await Promise.all([
    supabase.from('rate_settings').select('*').eq('user_id', session.user.id).single(),
    supabase.from('company_settings').select('*').eq('user_id', session.user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-app">
      <TopHeader title="Container Transport" subtitle="Fill in the quote details" />
      <ContainerQuoteForm
        rates={rates ?? DEFAULT_RATES}
        company={company ?? DEFAULT_COMPANY}
        userId={session.user.id}
      />
      <BottomNav />
    </div>
  );
}
