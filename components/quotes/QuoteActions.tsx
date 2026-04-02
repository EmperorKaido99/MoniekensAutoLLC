'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Quote, QuoteStatus } from '@/types/quote';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import QRModal from '@/components/quotes/QRModal';
import { FileDown, CheckCircle, Trash2, QrCode } from 'lucide-react';

interface Props { quote: Quote; userId: string; }

export default function QuoteActions({ quote, userId }: Props) {
  const router  = useRouter();
  const [loadingPDF,    setLoadingPDF]    = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [showQR,        setShowQR]        = useState(false);

  async function handleDownloadPDF() {
    if (!quote.pdf_url) return;
    setLoadingPDF(true);
    try {
      const res = await fetch(`/api/documents/signed-url?path=${encodeURIComponent(quote.pdf_url)}`);
      const { signedUrl } = await res.json();
      window.open(signedUrl, '_blank');
    } finally {
      setLoadingPDF(false);
    }
  }

  async function handleMarkPaid() {
    setLoadingStatus(true);
    const supabase = createClient();
    await supabase.from('quotes').update({ status: 'paid' }).eq('id', quote.id);
    router.refresh();
    setLoadingStatus(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('quotes').delete().eq('id', quote.id);
    router.push('/quotes');
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {quote.pdf_url && (
          <Button variant="secondary" size="lg" fullWidth loading={loadingPDF} onClick={handleDownloadPDF}>
            <FileDown size={18} /> Download PDF
          </Button>
        )}
        {quote.qr_code_data && (
          <Button variant="secondary" size="lg" fullWidth onClick={() => setShowQR(true)}>
            <QrCode size={18} /> View QR Code
          </Button>
        )}
        {quote.status !== 'paid' && (
          <Button variant="primary" size="lg" fullWidth loading={loadingStatus} onClick={handleMarkPaid}>
            <CheckCircle size={18} /> Mark as Paid
          </Button>
        )}
        <Button variant="danger" size="lg" fullWidth onClick={() => setConfirmDelete(true)}>
          <Trash2 size={18} /> Delete Quote
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Quote"
        message={`Are you sure you want to delete quote ${quote.quote_number}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />

      {quote.qr_code_data && (
        <QRModal
          open={showQR}
          onClose={() => setShowQR(false)}
          qrPayload={quote.qr_code_data}
          quoteNumber={quote.quote_number}
        />
      )}
    </>
  );
}
