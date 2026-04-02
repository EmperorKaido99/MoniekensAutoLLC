'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RateSettings, CompanySettings } from '@/types/settings';
import type { VehicleType, LineItem } from '@/types/quote';
import { buildQuoteNumber } from '@/lib/utils/generateQuoteNumber';
import { generateQuotePDF } from '@/lib/pdf/generateQuotePDF';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
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
  const [vehicleType,   setVehicleType]   = useState<VehicleType | ''>('');
  const [pickupLoc,     setPickupLoc]     = useState('');
  const [dropoffLoc,    setDropoffLoc]    = useState('');
  const [extraItems,    setExtraItems]    = useState<ExtraItem[]>([]);
  const [notes,         setNotes]         = useState('');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [savingDraft,   setSavingDraft]   = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const baseFee       = rates.base_towing_fee;
  const surcharge     = vehicleType ? rates[`${vehicleType}_surcharge` as keyof RateSettings] as number : 0;
  const extraTotal    = extraItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total         = baseFee + surcharge + extraTotal;

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim())  e.customerName  = 'Customer name is required';
    if (!customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (!vehicleType)          e.vehicleType   = 'Please select a vehicle type';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildLineItems(): LineItem[] {
    const items: LineItem[] = [
      { label: 'Base Towing Fee', quantity: 1, unit_price: baseFee, total: baseFee },
    ];
    if (vehicleType) {
      const label = vehicleType === 'amg' ? 'AMG' : vehicleType === 'suv' ? 'SUV' : 'Pickup Truck';
      items.push({ label: `${label} Surcharge`, quantity: 1, unit_price: surcharge, total: surcharge });
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
    try { await saveQuote('draft'); router.push('/quotes'); }
    catch (err) { console.error(err); }
    finally { setSavingDraft(false); }
  }

  async function handleGeneratePDF() {
    if (!validate()) return;
    setGeneratingPDF(true);
    try {
      const saved   = await saveQuote('sent');
      const pdfBlob = generateQuotePDF({ ...saved, created_at: saved.created_at }, company);
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
        <VehicleTypeToggle value={vehicleType} onChange={setVehicleType} />
        {errors.vehicleType && <p className="text-sm text-danger font-medium">{errors.vehicleType}</p>}
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
            <span className="font-semibold text-navy">R {baseFee.toLocaleString()}</span>
          </div>
          {vehicleType && (
            <div className="flex justify-between text-base">
              <span className="text-muted">Vehicle Surcharge</span>
              <span className="font-semibold text-navy">R {surcharge.toLocaleString()}</span>
            </div>
          )}
        </div>
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
