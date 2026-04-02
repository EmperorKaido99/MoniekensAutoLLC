import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LineItem, QuoteType } from '@/types/quote';
import type { CompanySettings } from '@/types/settings';
import { formatZAR } from '@/lib/utils/formatCurrency';

const NAVY: [number, number, number]  = [27, 77, 115];   // #1B4D73
const GREEN: [number, number, number] = [27, 115, 57];   // #1B7339
const LIGHT: [number, number, number] = [244, 245, 247]; // --bg
const MUTED: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK:  [number, number, number] = [17, 24, 39];

const TYPE_LABELS: Record<QuoteType, string> = {
  export:    'Vehicle Export',
  container: 'Container Transport',
  towing:    'Local Towing',
};

export interface QuotePDFInput {
  quote_number:   string;
  quote_type:     QuoteType;
  customer_name:  string;
  customer_phone: string;
  customer_email?: string;
  line_items:     LineItem[];
  total:          number;
  notes?:         string;
  created_at:     string;
}

export function generateQuotePDF(quote: QuotePDFInput, company: CompanySettings, qrDataUrl?: string): Blob {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW   = 210;
  const PH   = 297;
  const M    = 15;
  const CW   = PW - M * 2;

  // ── Navy header band ──────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PW, 44, 'F');

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text(company.company_name || "Dad's Auto Group", M, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 235);
  doc.text(TYPE_LABELS[quote.quote_type], M, 23);

  // QUOTATION — right aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...WHITE);
  doc.text('QUOTATION', PW - M, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 235);
  doc.text(`No: ${quote.quote_number}`, PW - M, 24, { align: 'right' });
  doc.text(
    `Date: ${new Date(quote.created_at).toLocaleDateString('en-ZA')}`,
    PW - M, 31, { align: 'right' }
  );

  let y = 54;

  // ── Client info panel ─────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, CW, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('PREPARED FOR', M + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(quote.customer_name, M + 5, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const contactParts = [quote.customer_phone, quote.customer_email].filter(Boolean).join('  ·  ');
  doc.text(contactParts, M + 5, y + 22);

  y += 36;

  // ── Line items table ──────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: quote.line_items.map(item => [
      item.label,
      item.quantity.toString(),
      formatZAR(item.unit_price),
      formatZAR(item.total),
    ]),
    foot: [['', '', 'TOTAL', formatZAR(quote.total)]],
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles:  { fontSize: 10, textColor: DARK },
    footStyles:  { fillColor: LIGHT, textColor: NAVY, fontStyle: 'bold', fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 42, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (quote.notes?.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('NOTES', M, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(quote.notes, CW);
    doc.text(lines, M, y + 12);
    y += 12 + lines.length * 5 + 8;
  }

  // ── Footer band ───────────────────────────────────────────────────────────
  // ── QR code (above footer) ────────────────────────────────────────────────
  if (qrDataUrl) {
    const qrSize = 28;
    const qrX    = PW - M - qrSize;
    const qrY    = PH - 24 - qrSize;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text('Scan to view', qrX + qrSize / 2, PH - 25, { align: 'center' });
  }

  // ── Footer band ───────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, PH - 20, PW, 20, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 210, 235);

  const footerParts = [
    company.company_name,
    company.company_phone,
    company.company_email,
    company.company_address,
    company.vat_number ? `VAT: ${company.vat_number}` : '',
  ].filter(Boolean);

  doc.text(footerParts.join('  ·  '), PW / 2, PH - 10, { align: 'center' });

  return doc.output('blob');
}
