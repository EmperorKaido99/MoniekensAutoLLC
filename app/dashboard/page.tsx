import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PlusCircle, Upload, ScanLine, FolderOpen } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatZAR(amount: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate() {
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [quotesThisMonth, docCount, paidTotal] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('quotes').select('total').eq('status', 'paid').gte('created_at', startOfMonth),
  ]);

  const totalInvoiced = (paidTotal.data ?? []).reduce((sum: number, q: { total: number }) => sum + (q.total ?? 0), 0);

  // Recent quotes
  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('id, customer_name, quote_type, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const quoteTypeLabel: Record<string, string> = {
    export: 'Vehicle Export', container: 'Container Transport', towing: 'Local Towing',
  };

  return (
    <div className="min-h-screen bg-app pb-24">
      {/* Header */}
      <header className="bg-navy text-white px-4 pt-4 pb-6">
        {/* Branding row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Dad's Auto Group</p>
            <p className="text-white/60 text-xs">Business Management</p>
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-2xl font-semibold">{getGreeting()}</h1>
        <p className="text-white/60 text-sm mt-1">{formatDate()}</p>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Quotes\nThis Month', value: String(quotesThisMonth.count ?? 0) },
            { label: 'Documents\nStored',  value: String(docCount.count ?? 0) },
            { label: 'Invoiced\nThis Month', value: formatZAR(totalInvoiced) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white font-bold text-xl leading-tight">{value}</p>
              <p className="text-white/60 text-xs mt-1 whitespace-pre-line leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Quote',        href: '/quotes/new',  icon: PlusCircle, color: 'bg-amber' },
              { label: 'Upload Document',  href: '/documents',   icon: Upload,      color: 'bg-info' },
              { label: 'Scan QR Code',     href: '/scan',        icon: ScanLine,    color: 'bg-navy' },
              { label: 'View Records',     href: '/documents',   icon: FolderOpen,  color: 'bg-success' },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href}>
                <Card className="flex flex-col items-center justify-center gap-3 py-6 active:scale-95 transition-transform cursor-pointer">
                  <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-navy text-center leading-tight">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Quotes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Recent Quotes</h2>
            <Link href="/quotes" className="text-amber text-sm font-semibold">View all</Link>
          </div>

          {!recentQuotes?.length ? (
            <Card>
              <p className="text-muted text-base text-center py-4">No quotes yet. Tap New Quote to get started.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {recentQuotes.map((q) => (
                <Link key={q.id} href={`/quotes/${q.id}`}>
                  <Card className="flex items-center justify-between gap-3 active:scale-[0.99] transition-transform">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-base truncate">{q.customer_name}</p>
                      <p className="text-muted text-sm mt-0.5">{quoteTypeLabel[q.quote_type] ?? q.quote_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="font-bold text-navy text-base">{formatZAR(q.total)}</p>
                      <Badge variant={q.status as 'draft' | 'sent' | 'paid'} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
