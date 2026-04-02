import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Plus } from 'lucide-react';
import type { Quote, QuoteStatus } from '@/types/quote';

const STATUS_TABS: { label: string; value: QuoteStatus | 'all' }[] = [
  { label: 'All',   value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent',  value: 'sent' },
  { label: 'Paid',  value: 'paid' },
];

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { status } = await searchParams;
  const activeStatus = status ?? 'all';

  let query = supabase
    .from('quotes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (activeStatus !== 'all') {
    query = query.eq('status', activeStatus);
  }

  const { data: quotes } = await query;

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader
        title="Quotes"
        subtitle={`${quotes?.length ?? 0} record${quotes?.length !== 1 ? 's' : ''}`}
        action={
          <Link
            href="/quotes/new"
            className="flex items-center gap-1.5 bg-amber text-white text-sm font-semibold px-3 py-2 rounded-xl min-h-[40px]"
          >
            <Plus size={16} /> New
          </Link>
        }
      />

      {/* Status filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-1 overflow-x-auto scrollbar-none py-2">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/quotes' : `/quotes?status=${tab.value}`}
            className={[
              'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
              activeStatus === tab.value
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {!quotes?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted text-lg font-medium">No quotes yet</p>
            <p className="text-muted text-sm mt-1">Tap New to create your first quote</p>
            <Link
              href="/quotes/new"
              className="mt-5 bg-amber text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <Plus size={18} /> New Quote
            </Link>
          </div>
        ) : (
          quotes.map(q => <QuoteCard key={q.id} quote={q as Quote} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
