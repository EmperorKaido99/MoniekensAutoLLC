'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RateSettings, CompanySettings } from '@/types/settings';
import type { LineItem } from '@/types/quote';
import { buildQuoteNumber } from '@/lib/utils/generateQuoteNumber';
import { generateQuotePDF } from '@/lib/pdf/generateQuotePDF';
import { downloadBlob, fetchLogoDataUrl, uploadQuotePdfInBackground } from '@/lib/pdf/helpers';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Toast from '@/components/ui/Toast';
import LineItemsEditor, { type ExtraItem } from './LineItemsEditor';
import RunningTotal from './RunningTotal';

interface Props { rates: RateSettings; company: CompanySettings; userId: string; }

export default function ContainerQuoteForm({ rates, company, userId }: Props) {
  const router = useRouter();

  const [customerName,  setCustomerName]  = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [containerRef,  setContainerRef]  = useState('');
  const [origin,        setOrigin]        = useState('');
  const [destination,   setDestination]   = useState('');
  const [loadPrice,     setLoadPrice]     = useState(rates.container_load_price);
  const [landFee,       setLandFee]       = useState(rates.container_land_fee);
  const [lotPayment,    setLotPayment]    = useState(rates.container_lot_payment);
  const [extraItems,    setExtraItems]    = useState<ExtraItem[]>([]);
  const [notes,         setNotes]         = useState('');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [savingDraft,   setSavingDraft]   = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [toast,         setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const extraTotal = extraItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total = loadPrice + landFee + lotPayment + extraTotal;

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim())  e.customerName  = 'Customer name is required';
    if (!customerPhone.trim()) e.customerPhone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildLineItems(): LineItem[] {
    const items: LineItem[] = [
      { label: 'Container Load Transport', quantity: 1, unit_price: loadPrice,  total: loadPrice },
      { label: 'Container Land Fee',       quantity: 1, unit_price: landFee,    total: landFee },
      { label: 'Container Lot Payment',    quantity: 1, unit_price: lotPayment, total: lotPayment },
    ];
    extraItems.forEach(ei => items.push({ label: ei.label || 'Additional item', quantity: ei.quantity, unit_price: ei.unit_price, total: ei.quantity * ei.unit_price }));
    return items;
  }

  async function saveQuote(status: 'draft' | 'sent') {
    const supabase = createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', `${year}-01-01T00:00:00Z`);
    const quoteNumber = buildQuoteNumber(count ?? 0);
    const lineItems   = buildLineItems();
    const notesText   = [containerRef && `Container Ref: ${containerRef}`, origin && `Origin: ${origin}`, destination && `Destination: ${destination}`, notes].filter(Boolean).join('\n');

    const { data, error } = await supabase.from('quotes').insert({
      user_id: userId, quote_type: 'container', quote_number: quoteNumber,
      customer_name: customerName.trim(), customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      status, line_items: lineItems, subtotal: total, total,
      notes: notesText || null,
    }).select().single();

    if (error) throw error;
    return data;
  }

  async function handleSaveDraft() {
    if (!validate()) return;
    setSavingDraft(true);
    try {
      await saveQuote('draft');
      setToast({ message: 'Draft saved successfully', type: 'success' });
      setTimeout(() => router.push('/quotes'), 1200);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save draft. Please try again.', type: 'error' });
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleGeneratePDF() {
    if (!validate()) return;
    setGeneratingPDF(true);

    try {
      const saved       = await saveQuote('sent');
      const logoDataUrl = await fetchLogoDataUrl();
      const pdfBlob     = generateQuotePDF({ ...saved, created_at: saved.created_at }, company, logoDataUrl);

      downloadBlob(pdfBlob, `${saved.quote_number}.pdf`);
      uploadQuotePdfInBackground(saved.id, pdfBlob);

      setToast({ message: 'Quote downloaded', type: 'success' });
      setTimeout(() => router.push('/quotes'), 1200);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to generate PDF. Please try again.', type: 'error' });
    } finally {
      setGeneratingPDF(false);
    }
  }

  return (
    <div className="px-4 py-5 space-y-5 pb-44">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Customer</h2>
        <Input label="Customer Name"    value={customerName}  onChange={e => setCustomerName(e.target.value)}  error={errors.customerName}  placeholder="Full name" />
        <Input label="Phone Number"     type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} error={errors.customerPhone} placeholder="+27 ..." />
        <Input label="Email (Optional)" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@example.com" />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Container Details</h2>
        <Input label="Container Reference / ID" value={containerRef}  onChange={e => setContainerRef(e.target.value)}  placeholder="e.g. CONT-2026-001" />
        <Input label="Origin"                   value={origin}        onChange={e => setOrigin(e.target.value)}        placeholder="e.g. Durban" />
        <Input label="Destination"              value={destination}   onChange={e => setDestination(e.target.value)}   placeholder="e.g. Johannesburg" />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Pricing</h2>
        <Input label="Container Load Transport ($)" type="number" min="0" value={loadPrice  || ''} onChange={e => setLoadPrice(+e.target.value)} />
        <Input label="Container Land Fee ($)"       type="number" min="0" value={landFee    || ''} onChange={e => setLandFee(+e.target.value)} />
        <Input label="Container Lot Payment ($)"    type="number" min="0" value={lotPayment || ''} onChange={e => setLotPayment(+e.target.value)} />
      </section>

      <section><LineItemsEditor items={extraItems} onChange={setExtraItems} /></section>
      <section><Textarea label="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." /></section>

      <RunningTotal total={total} onSaveDraft={handleSaveDraft} onGeneratePDF={handleGeneratePDF} savingDraft={savingDraft} generatingPDF={generatingPDF} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

