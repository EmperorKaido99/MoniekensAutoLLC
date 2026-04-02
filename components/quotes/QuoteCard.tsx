import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatZAR } from '@/lib/utils/formatCurrency';
import type { Quote, QuoteStatus } from '@/types/quote';

const TYPE_LABELS: Record<string, string> = {
  export:    'Vehicle Export',
  container: 'Container Transport',
  towing:    'Local Towing',
};

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <Link href={`/quotes/${quote.id}`}>
      <Card className="flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-base truncate">{quote.customer_name}</p>
          <p className="text-muted text-sm mt-0.5">{TYPE_LABELS[quote.quote_type] ?? quote.quote_type}</p>
          <p className="text-muted text-xs mt-0.5">{quote.quote_number}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <p className="font-bold text-navy text-base">{formatZAR(quote.total)}</p>
          <Badge variant={quote.status as QuoteStatus} />
        </div>
      </Card>
    </Link>
  );
}
