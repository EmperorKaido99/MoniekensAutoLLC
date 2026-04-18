'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Quote, QuoteStatus } from '@/types/quote';
import type { CompanySettings } from '@/types/settings';
import { generateQuotePDF } from '@/lib/pdf/generateQuotePDF';
import { generateQRDataUrl } from '@/lib/qr';
import { downloadBlob, fetchLogoDataUrl, uploadQuotePdfInBackground } from '@/lib/pdf/helpers';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import QRModal from '@/components/quotes/QRModal';
import { FileDown, Printer, CheckCircle, Trash2, QrCode } from 'lucide-react';

interface Props { quote: Quote; userId: string; company: CompanySettings; }

export default function QuoteActions({ quote, userId, company }: Props) {
  const router  = useRouter();
  const [loadingPDF,    setLoadingPDF]    = useState(false);
  const [loadingPrint,  setLoadingPrint]  = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [showQR,        setShowQR]        = useState(false);
  const [pdfError,      setPdfError]      = useState<string | null>(null);

  /** Regenerates the PDF client-side from the existing quote data. */
  async function buildPdfBlob(): Promise<Blob> {
    const qrPayload = quote.qr_code_data ?? `${window.location.origin}/quotes/${quote.id}`;
    const [qrDataUrl, logoDataUrl] = await Promise.all([
      generateQRDataUrl(qrPayload),
      fetchLogoDataUrl(),
    ]);

    if (!quote.qr_code_data) {
      const supabase = createClient();
      await supabase.from('quotes').update({ qr_code_data: qrPayload }).eq('id', quote.id);
    }

    return generateQuotePDF(
      {
        quote_number:   quote.quote_number,
        quote_type:     quote.quote_type,
        customer_name:  quote.customer_name,
        customer_phone: quote.customer_phone,
        customer_email: quote.customer_email,
        line_items:     quote.line_items,
        total:          quote.total,
        notes:          quote.notes,
        created_at:     quote.created_at,
      },
      company,
      qrDataUrl,
      logoDataUrl,
    );
  }

  async function handleDownloadPDF() {
    setPdfError(null);
    setLoadingPDF(true);
    try {
      const blob = await buildPdfBlob();
      downloadBlob(blob, `Quote-${quote.quote_number}.pdf`);
      if (!quote.pdf_url) uploadQuotePdfInBackground(quote.id, blob);
    } catch (err: any) {
      setPdfError(err?.message ?? 'Could not download PDF. Please try again.');
    } finally {
      setLoadingPDF(false);
    }
  }

  async function handlePrint() {
    setPdfError(null);
    setLoadingPrint(true);
    try {
      const blob = await buildPdfBlob();
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (!quote.pdf_url) uploadQuotePdfInBackground(quote.id, blob);
    } catch (err: any) {
      setPdfError(err?.message ?? 'Could not open PDF. Please try again.');
    } finally {
      setLoadingPrint(false);
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
        <Button variant="secondary" size="lg" fullWidth loading={loadingPDF} onClick={handleDownloadPDF}>
          <FileDown size={18} /> Download PDF
        </Button>
        <Button variant="secondary" size="lg" fullWidth loading={loadingPrint} onClick={handlePrint}>
          <Printer size={18} /> Print Invoice
        </Button>
        {pdfError && (
          <p className="text-sm text-danger text-center">{pdfError}</p>
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

