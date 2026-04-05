import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import CalendarView, { type CalEvent } from '@/components/calendar/CalendarView';

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [{ data: quotes }, { data: documents }] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, quote_number, customer_name, quote_type, status, total, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, customer_name, document_type, uploaded_at')
      .eq('user_id', session.user.id)
      .order('uploaded_at', { ascending: false }),
  ]);

  const TYPE_LABELS: Record<string, string> = {
    export: 'Vehicle Export', container: 'Container Transport', towing: 'Local Towing',
  };

  const events: CalEvent[] = [
    ...(quotes ?? []).map(q => ({
      id:     q.id,
      date:   q.created_at.slice(0, 10),
      title:  q.customer_name,
      sub:    `${q.quote_number} · ${TYPE_LABELS[q.quote_type] ?? q.quote_type}`,
      type:   'quote' as const,
      href:   `/quotes/${q.id}`,
      status: q.status,
    })),
    ...(documents ?? []).map(d => ({
      id:    d.id,
      date:  (d.uploaded_at ?? '').slice(0, 10),
      title: d.customer_name ?? 'Document',
      sub:   d.document_type ?? '',
      type:  'document' as const,
      href:  `/documents/${d.id}`,
    })),
  ];

  const totalEvents = (quotes?.length ?? 0) + (documents?.length ?? 0);

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader
        title="Calendar"
        subtitle={`${totalEvents} event${totalEvents !== 1 ? 's' : ''} total`}
      />
      <CalendarView events={events} />
      <BottomNav />
    </div>
  );
}
