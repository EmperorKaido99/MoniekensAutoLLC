import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import ExportQuoteForm from '@/components/quotes/ExportQuoteForm';
import { DEFAULT_RATES, DEFAULT_COMPANY } from '@/types/settings';

export default async function ExportQuotePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [{ data: rates }, { data: company }] = await Promise.all([
    supabase.from('rate_settings').select('*').eq('user_id', session.user.id).single(),
    supabase.from('company_settings').select('*').eq('user_id', session.user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-app">
      <TopHeader title="Vehicle Export" subtitle="Fill in the quote details" />
      <ExportQuoteForm
        rates={rates ?? DEFAULT_RATES}
        company={company ?? DEFAULT_COMPANY}
        userId={session.user.id}
      />
      <BottomNav />
    </div>
  );
}
