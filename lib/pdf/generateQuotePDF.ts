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

export function generateQuotePDF(quote: QuotePDFInput, company: CompanySettings, logoDataUrl?: string): Blob {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW   = 210;
  const PH   = 297;
  const M    = 15;
  const CW   = PW - M * 2;

  // ── Navy header band ──────────────────────────────────────────────────────
  // Height: 56mm to accommodate company name + type + phone/email + address
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PW, 56, 'F');

  // Logo (if available) — fits inside a 32×22mm reserved area at natural aspect ratio
  const LOGO_W = 32;
  const LOGO_H = 22;
  let textX = M;
  if (logoDataUrl) {
    try {
      const props = doc.getImageProperties(logoDataUrl);
      const scale = Math.min(LOGO_W / props.width, LOGO_H / props.height);
      const lw    = props.width  * scale;
      const lh    = props.height * scale;
      const lx    = M;
      const ly    = 5 + (LOGO_H - lh) / 2; // vertically centred in reserved area
      doc.addImage(logoDataUrl, 'PNG', lx, ly, lw, lh);
      textX = M + LOGO_W + 6;
    } catch {
      // fall through — render text from M as if no logo
    }
  }

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text(company.company_name || 'MoniekensAutoLLC', textX, 16);

  // Quote type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 235);
  doc.text(TYPE_LABELS[quote.quote_type], textX, 23);

  // Company phone · email
  const headerContact = [company.company_phone, company.company_email].filter(Boolean).join('  ·  ');
  if (headerContact) {
    doc.setFontSize(8);
    doc.text(headerContact, textX, 31);
  }

  // Company address
  if (company.company_address) {
    doc.setFontSize(8);
    const addrLine = doc.splitTextToSize(company.company_address, PW / 2 - textX - 5);
    doc.text(addrLine[0], textX, 39); // single line to keep header tidy
  }

  // QUOTATION — right aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...WHITE);
  doc.text('QUOTATION', PW - M, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 235);
  doc.text(`No: ${quote.quote_number}`, PW - M, 26, { align: 'right' });
  doc.text(
    `Date: ${new Date(quote.created_at).toLocaleDateString('en-ZA')}`,
    PW - M, 34, { align: 'right' }
  );

  let y = 66;

  // ── Two-column info panels ─────────────────────────────────────────────────
  const halfW = (CW - 5) / 2;

  // LEFT: FROM (company)
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, halfW, 38, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('FROM', M + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(company.company_name || '', M + 5, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let coY = y + 22;
  if (company.company_phone || company.company_email) {
    const co = [company.company_phone, company.company_email].filter(Boolean).join('  ·  ');
    doc.text(doc.splitTextToSize(co, halfW - 10)[0], M + 5, coY);
    coY += 6;
  }
  if (company.company_address) {
    doc.text(doc.splitTextToSize(company.company_address, halfW - 10)[0], M + 5, coY);
  }

  // RIGHT: PREPARED FOR (customer)
  const rx = M + halfW + 5;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(rx, y, halfW, 38, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('PREPARED FOR', rx + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(quote.customer_name, rx + 5, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const contactParts = [quote.customer_phone, quote.customer_email].filter(Boolean).join('  ·  ');
  if (contactParts) doc.text(contactParts, rx + 5, y + 22);

  y += 46;

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
  ].filter(Boolean);

  doc.text(footerParts.join('  ·  '), PW / 2, PH - 10, { align: 'center' });

  return doc.output('blob');
}
