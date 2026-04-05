import { jsPDF } from 'jspdf';
import type { CompanySettings } from '@/types/settings';
import { formatZAR } from '@/lib/utils/formatCurrency';

const NAVY: [number, number, number] = [27, 77, 115];
const LIGHT: [number, number, number] = [244, 245, 247];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK:  [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];

export interface DeedPDFInput {
  seller_name:        string;
  buyer_name:         string;
  buyer_id:           string;
  car_make:           string;
  car_model:          string;
  car_year:           number | string;
  car_colour:         string;
  vin_number:         string;
  engine_number:      string;
  sale_price:         number;
  sale_date:          string;
  special_conditions?: string;
}

function numberToWords(n: number): string {
  // Simple South African format: "R 15,000.00" — full word conversion omitted for brevity
  return formatZAR(n);
}

export function generateDeedPDF(deed: DeedPDFInput, company: CompanySettings): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const PH = 297;
  const M  = 20;
  const CW = PW - M * 2;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PW, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text('DEED OF SALE — MOTOR VEHICLE', PW / 2, 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 235);
  doc.text(company.company_name || "MoniekensAutoLLC", PW / 2, 27, { align: 'center' });

  let y = 46;

  function sectionBox(title: string, lines: [string, string][], boxY: number): number {
    const lineH = 8;
    const h = 12 + lines.length * lineH;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(M, boxY, CW, h, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(title, M + 5, boxY + 7);

    lines.forEach(([label, value], i) => {
      const ly = boxY + 14 + i * lineH;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(label, M + 5, ly);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(value || '—', M + 55, ly);
    });

    return boxY + h + 6;
  }

  // Seller
  y = sectionBox('SELLER', [
    ['Full Name:', deed.seller_name],
  ], y);

  // Buyer
  y = sectionBox('BUYER', [
    ['Full Name:', deed.buyer_name],
    ['ID Number:', deed.buyer_id],
  ], y);

  // Vehicle
  y = sectionBox('VEHICLE DETAILS', [
    ['Make & Model:', `${deed.car_make} ${deed.car_model}`],
    ['Year:',        String(deed.car_year)],
    ['Colour:',      deed.car_colour],
    ['VIN Number:',  deed.vin_number],
    ['Engine No:',   deed.engine_number],
  ], y);

  // Sale
  y = sectionBox('SALE DETAILS', [
    ['Sale Price:', formatZAR(deed.sale_price)],
    ['Date of Sale:', new Date(deed.sale_date).toLocaleDateString('en-ZA', { dateStyle: 'long' })],
  ], y);

  y += 4;

  // ── Standard clauses ──────────────────────────────────────────────────────
  const clauses = [
    'The Seller sells the vehicle described above to the Buyer for the purchase price stated, and the Buyer agrees to purchase it.',
    'The vehicle is sold VOETSTOOTS (as is). The Seller makes no warranty as to the condition of the vehicle.',
    'Ownership of the vehicle shall pass to the Buyer only upon receipt of the full purchase price.',
    'The Buyer confirms they have inspected the vehicle and accept it in its current condition.',
  ];

  if (deed.special_conditions?.trim()) {
    clauses.push(`Special Conditions: ${deed.special_conditions}`);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('TERMS & CONDITIONS', M, y + 4);
  y += 10;

  clauses.forEach((clause, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`${i + 1}. ${clause}`, CW);
    doc.text(lines, M, y);
    y += lines.length * 5 + 3;
  });

  y += 8;

  // ── Signature lines ───────────────────────────────────────────────────────
  const sigCols = [M, M + CW / 2 + 5];
  const sigLabels = ['Seller', 'Buyer'];

  sigCols.forEach((x, i) => {
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);
    doc.line(x, y + 20, x + CW / 2 - 10, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${sigLabels[i]}: ___________________`, x, y + 26);
    doc.text('Date: ___________________', x, y + 34);
    doc.text('Witness: ___________________', x, y + 42);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, PH - 18, PW, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 210, 235);
  const footer = [company.company_phone, company.company_email, company.company_address].filter(Boolean).join('  ·  ');
  doc.text(footer, PW / 2, PH - 7, { align: 'center' });

  return doc.output('blob');
}
