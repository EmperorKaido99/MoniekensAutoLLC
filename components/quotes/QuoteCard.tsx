// QuoteCard — summary card for a single quote shown in the quotes list
import type { Quote } from '@/types/quote';

export default function QuoteCard({ quote }: { quote: Quote }) {
  return <div className="rounded-lg border p-4">{quote.id}</div>;
}
