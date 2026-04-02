'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RateSettings, CompanySettings } from '@/types/settings';
import type { LineItem } from '@/types/quote';
import { buildQuoteNumber } from '@/lib/utils/generateQuoteNumber';
import { generateQuotePDF } from '@/lib/pdf/generateQuotePDF';
import { generateQRDataUrl } from '@/lib/qr';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
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
    try { await saveQuote('draft'); router.push('/quotes'); }
    catch (err) { console.error(err); }
    finally { setSavingDraft(false); }
  }

  async function handleGeneratePDF() {
    if (!validate()) return;
    setGeneratingPDF(true);
    try {
      const saved     = await saveQuote('sent');
      const qrPayload = `${window.location.origin}/quotes/${saved.id}`;
      const qrDataUrl = await generateQRDataUrl(qrPayload);
      const supabase  = createClient();
      await supabase.from('quotes').update({ qr_code_data: qrPayload }).eq('id', saved.id);
      const pdfBlob = generateQuotePDF({ ...saved, created_at: saved.created_at }, company, qrDataUrl);
      const base64  = await blobToBase64(pdfBlob);
      await fetch('/api/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quote_id: saved.id, pdf_base64: base64 }) });
      const urlRes = await fetch(`/api/documents/signed-url?path=quotes/${userId}/${saved.id}.pdf`);
      const { signedUrl } = await urlRes.json();
      if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: `Quote ${saved.quote_number}`, url: signedUrl });
      else window.open(signedUrl, '_blank');
      router.push('/quotes');
    } catch (err) { console.error(err); }
    finally { setGeneratingPDF(false); }
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
        <Input label="Container Load Transport (R)" type="number" min="0" value={loadPrice}  onChange={e => setLoadPrice(+e.target.value)} />
        <Input label="Container Land Fee (R)"       type="number" min="0" value={landFee}    onChange={e => setLandFee(+e.target.value)} />
        <Input label="Container Lot Payment (R)"    type="number" min="0" value={lotPayment} onChange={e => setLotPayment(+e.target.value)} />
      </section>

      <section><LineItemsEditor items={extraItems} onChange={setExtraItems} /></section>
      <section><Textarea label="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." /></section>

      <RunningTotal total={total} onSaveDraft={handleSaveDraft} onGeneratePDF={handleGeneratePDF} savingDraft={savingDraft} generatingPDF={generatingPDF} />
    </div>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
