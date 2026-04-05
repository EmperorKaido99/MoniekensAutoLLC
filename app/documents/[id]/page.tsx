import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PDFViewer from '@/components/documents/PDFViewer';
import DocumentDeleteButton from '@/components/documents/DocumentDeleteButton';
import DocumentActions from '@/components/documents/DocumentActions';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { VaultDocument, DocumentType, DOC_TYPE_LABELS } from '@/types/document';
import { DOC_TYPE_LABELS as LABELS } from '@/types/document';

const TYPE_TO_BADGE: Record<DocumentType, 'car_title' | 'deed' | 'invoice' | 'quote' | 'other'> = {
  car_title:    'car_title',
  deed_of_sale: 'deed',
  invoice:      'invoice',
  quote:        'quote',
  other:        'other',
};

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (!doc) notFound();

  const d = doc as VaultDocument;

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader title={d.customer_name} subtitle={LABELS[d.document_type]} />

      <div className="px-4 py-5 space-y-4">
        {/* Meta card */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <Badge variant={TYPE_TO_BADGE[d.document_type]} />
            <span className="text-muted text-xs">
              {new Date(d.uploaded_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {d.car_make && (
              <div className="flex justify-between py-2">
                <span className="text-muted text-sm">Make</span>
                <span className="text-navy text-sm font-medium">{d.car_make}</span>
              </div>
            )}
            {d.car_model && (
              <div className="flex justify-between py-2">
                <span className="text-muted text-sm">Model</span>
                <span className="text-navy text-sm font-medium">{d.car_model}</span>
              </div>
            )}
            {d.car_year && (
              <div className="flex justify-between py-2">
                <span className="text-muted text-sm">Year</span>
                <span className="text-navy text-sm font-medium">{d.car_year}</span>
              </div>
            )}
            {d.car_price != null && (
              <div className="flex justify-between py-2">
                <span className="text-muted text-sm">Price</span>
                <span className="text-navy text-sm font-semibold">{formatCurrency(d.car_price)}</span>
              </div>
            )}
            {d.notes && (
              <div className="py-2">
                <span className="text-muted text-sm block mb-1">Notes</span>
                <span className="text-navy text-sm whitespace-pre-wrap">{d.notes}</span>
              </div>
            )}
          </div>
        </Card>

        {/* PDF viewer */}
        <PDFViewer filePath={d.file_path} />

        {/* Download / Print */}
        <DocumentActions filePath={d.file_path} />

        {/* Delete */}
        <DocumentDeleteButton docId={d.id} />
      </div>

      <BottomNav />
    </div>
  );
}
