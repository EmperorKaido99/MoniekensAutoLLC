import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import QuoteActions from '@/components/quotes/QuoteActions';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { Quote, QuoteStatus } from '@/types/quote';
import { DEFAULT_COMPANY } from '@/types/settings';

const TYPE_LABELS: Record<string, string> = {
  export: 'Vehicle Export', container: 'Container Transport', towing: 'Local Towing',
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const [{ data: quote }, { data: company }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', id).eq('user_id', session.user.id).single(),
    supabase.from('company_settings').select('*').eq('user_id', session.user.id).single(),
  ]);

  if (!quote) notFound();

  const q = quote as Quote;

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader
        title={q.quote_number}
        subtitle={TYPE_LABELS[q.quote_type] ?? q.quote_type}
      />

      <div className="px-4 py-5 space-y-4">
        {/* Status + date */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm">Status</p>
            <div className="mt-1"><Badge variant={q.status as QuoteStatus} /></div>
          </div>
          <div className="text-right">
            <p className="text-muted text-sm">Created</p>
            <p className="text-navy font-medium text-sm mt-1">
              {new Date(q.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}
            </p>
          </div>
        </Card>

        {/* Customer */}
        <Card>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">Customer</p>
          <p className="text-navy font-semibold text-lg">{q.customer_name}</p>
          <p className="text-muted text-base mt-0.5">{q.customer_phone}</p>
          {q.customer_email && <p className="text-muted text-base">{q.customer_email}</p>}
        </Card>

        {/* Line items */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Line Items</p>
          </div>
          <div className="divide-y divide-gray-100">
            {q.line_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-base font-medium">{item.label}</p>
                  {item.quantity > 1 && (
                    <p className="text-muted text-sm">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                  )}
                </div>
                <p className="text-navy font-semibold shrink-0">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <p className="text-navy font-bold text-base uppercase tracking-wide">Total</p>
            <p className="text-navy font-bold text-xl">{formatCurrency(q.total)}</p>
          </div>
        </Card>

        {/* Notes */}
        {q.notes && (
          <Card>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">Notes</p>
            <p className="text-navy text-base whitespace-pre-wrap">{q.notes}</p>
          </Card>
        )}

        {/* Actions */}
        <QuoteActions quote={q} userId={session.user.id} company={company ?? DEFAULT_COMPANY} />
      </div>

      <BottomNav />
    </div>
  );
}
