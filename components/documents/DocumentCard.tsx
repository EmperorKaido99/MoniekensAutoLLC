import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatZAR } from '@/lib/utils/formatCurrency';
import type { VaultDocument, DocumentType } from '@/types/document';
import { FileText } from 'lucide-react';

const TYPE_TO_BADGE: Record<DocumentType, 'deed' | 'invoice' | 'quote' | 'other'> = {
  deed_of_sale: 'deed',
  invoice:      'invoice',
  quote:        'quote',
  other:        'other',
};

export default function DocumentCard({ doc }: { doc: VaultDocument }) {
  const carInfo = [doc.car_make, doc.car_model, doc.car_year].filter(Boolean).join(' ');

  return (
    <Link href={`/documents/${doc.id}`}>
      <Card className="flex items-start gap-3 active:scale-[0.99] transition-transform cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
          <FileText size={20} className="text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-navy text-base leading-tight">{doc.customer_name}</p>
            <Badge variant={TYPE_TO_BADGE[doc.document_type]} />
          </div>
          {carInfo && (
            <p className="text-muted text-sm mt-1">{carInfo}</p>
          )}
          {doc.car_price != null && (
            <p className="text-navy text-sm font-semibold mt-0.5">{formatZAR(doc.car_price)}</p>
          )}
          <p className="text-muted text-xs mt-1">
            {new Date(doc.uploaded_at).toLocaleString('en-ZA', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </Card>
    </Link>
  );
}
