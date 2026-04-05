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
import Toast from '@/components/ui/Toast';
import VehicleTypeToggle from './VehicleTypeToggle';
import LineItemsEditor, { type ExtraItem } from './LineItemsEditor';
import RunningTotal from './RunningTotal';

interface Props { rates: RateSettings; company: CompanySettings; userId: string; }

export default function TowingQuoteForm({ rates, company, userId }: Props) {
  const router = useRouter();

  const [customerName,  setCustomerName]  = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleMake,   setVehicleMake]   = useState('');
  const [vehicleModel,  setVehicleModel]  = useState('');
  const [vehicleYear,   setVehicleYear]   = useState('');
  const [isSpecialVehicle, setIsSpecialVehicle] = useState(false);
  const [vehicleName,      setVehicleName]      = useState('');
  const [pickupLoc,        setPickupLoc]        = useState('');
  const [dropoffLoc,    setDropoffLoc]    = useState('');
  const [extraItems,    setExtraItems]    = useState<ExtraItem[]>([]);
  const [notes,         setNotes]         = useState('');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [savingDraft,   setSavingDraft]   = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [toast,         setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const baseFee    = rates.base_towing_fee;
  const surcharge  = isSpecialVehicle ? rates.amg_surcharge : 0;
  const extraTotal = extraItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total      = baseFee + surcharge + extraTotal;

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim())  e.customerName  = 'Customer name is required';
    if (!customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (isSpecialVehicle && !vehicleName.trim()) e.vehicleName = 'Please enter the vehicle name';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildLineItems(): LineItem[] {
    const items: LineItem[] = [
      { label: 'Base Towing Fee', quantity: 1, unit_price: baseFee, total: baseFee },
    ];
    if (isSpecialVehicle) {
      items.push({ label: `Special Vehicle Surcharge — ${vehicleName}`, quantity: 1, unit_price: surcharge, total: surcharge });
    }
    extraItems.forEach(ei => items.push({ label: ei.label || 'Additional item', quantity: ei.quantity, unit_price: ei.unit_price, total: ei.quantity * ei.unit_price }));
    return items;
  }

  async function saveQuote(status: 'draft' | 'sent') {
    const supabase = createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', `${year}-01-01T00:00:00Z`);
    const quoteNumber = buildQuoteNumber(count ?? 0);
    const lineItems   = buildLineItems();
    const notesText   = [
      vehicleMake   && `Make: ${vehicleMake}`,
      vehicleModel  && `Model: ${vehicleModel}`,
      vehicleYear   && `Year: ${vehicleYear}`,
      pickupLoc     && `Pickup: ${pickupLoc}`,
      dropoffLoc    && `Drop-off: ${dropoffLoc}`,
      notes,
    ].filter(Boolean).join('\n');

    const { data, error } = await supabase.from('quotes').insert({
      user_id: userId, quote_type: 'towing', quote_number: quoteNumber,
      customer_name: customerName.trim(), customer_phone: customerPhone.trim(),
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
      const saved     = await saveQuote('sent');
      const qrPayload = `${window.location.origin}/quotes/${saved.id}`;
      const qrDataUrl = await generateQRDataUrl(qrPayload);
      const supabase  = createClient();
      await supabase.from('quotes').update({ qr_code_data: qrPayload }).eq('id', saved.id);
      const logoDataUrl = await fetchLogoDataUrl();
      const pdfBlob = generateQuotePDF({ ...saved, created_at: saved.created_at }, company, qrDataUrl, logoDataUrl);
      const base64  = await blobToBase64(pdfBlob);
      const pdfRes  = await fetch('/api/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quote_id: saved.id, pdf_base64: base64 }) });
      if (!pdfRes.ok) throw new Error('PDF generation failed');
      const urlRes = await fetch(`/api/documents/signed-url?path=quotes/${userId}/${saved.id}.pdf`);
      const { signedUrl } = await urlRes.json();
      if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: `Quote ${saved.quote_number}`, url: signedUrl });
      else window.open(signedUrl, '_blank');
      router.push('/quotes');
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
        <Input label="Customer Name" value={customerName}  onChange={e => setCustomerName(e.target.value)}  error={errors.customerName}  placeholder="Full name" />
        <Input label="Phone Number"  type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} error={errors.customerPhone} placeholder="+27 ..." />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Vehicle</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Make"  value={vehicleMake}  onChange={e => setVehicleMake(e.target.value)}  placeholder="e.g. Toyota" />
          <Input label="Model" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Hilux" />
        </div>
        <Input label="Year" type="number" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} placeholder="e.g. 2022" />
        <VehicleTypeToggle
          isSpecial={isSpecialVehicle}
          vehicleName={vehicleName}
          surcharge={rates.amg_surcharge}
          onToggle={setIsSpecialVehicle}
          onNameChange={setVehicleName}
          error={errors.vehicleName}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Locations</h2>
        <Input label="Pickup Location"   value={pickupLoc}  onChange={e => setPickupLoc(e.target.value)}  placeholder="Pickup address" />
        <Input label="Drop-off Location" value={dropoffLoc} onChange={e => setDropoffLoc(e.target.value)} placeholder="Drop-off address" />
      </section>

      {/* Read-only rate summary */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Pricing</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex justify-between text-base">
            <span className="text-muted">Base Towing Fee</span>
            <span className="font-semibold text-navy">$ {baseFee.toLocaleString()}</span>
          </div>
          {isSpecialVehicle && (
            <div className="flex justify-between text-base">
              <span className="text-muted">Special Vehicle Surcharge</span>
              <span className="font-semibold text-navy">$ {surcharge.toLocaleString()}</span>
            </div>
          )}
        </div>
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

async function fetchLogoDataUrl(): Promise<string | undefined> {
  try {
    const res = await fetch('/images/Logo.png');
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
