import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import RatesForm from '@/components/settings/RatesForm';
import LogoutButton from '@/components/ui/LogoutButton';
import Card from '@/components/ui/Card';
import { DEFAULT_RATES, DEFAULT_COMPANY } from '@/types/settings';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [{ data: rates }, { data: company }] = await Promise.all([
    supabase.from('rate_settings').select('*').eq('user_id', session.user.id).single(),
    supabase.from('company_settings').select('*').eq('user_id', session.user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader title="Settings" subtitle="Rates, company details & account" />

      <RatesForm
        initialRates={rates ?? DEFAULT_RATES}
        initialCompany={company ?? DEFAULT_COMPANY}
        userId={session.user.id}
        hasExistingRates={!!rates?.id}
        hasExistingCompany={!!company?.id}
      />

      {/* Account section */}
      <div className="px-4 pb-6">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-4">Account</h2>
        <Card>
          <p className="text-muted text-sm mb-4">{session.user.email}</p>
          <LogoutButton />
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
