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

interface Props {
  rates:   RateSettings;
  company: CompanySettings;
  userId:  string;
}

export default function ExportQuoteForm({ rates, company, userId }: Props) {
  const router = useRouter();

  const [customerName,  setCustomerName]  = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [numCars,          setNumCars]          = useState(1);
  const [isSpecialVehicle, setIsSpecialVehicle] = useState(false);
  const [vehicleName,      setVehicleName]      = useState('');
  const [loadPrice,        setLoadPrice]        = useState(rates.container_load_price);
  const [lotPayment,       setLotPayment]       = useState(rates.container_lot_payment);
  const [landFee,          setLandFee]          = useState(rates.container_land_fee);
  const [extraItems,       setExtraItems]       = useState<ExtraItem[]>([]);
  const [notes,            setNotes]            = useState('');

  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [savingDraft,   setSavingDraft]   = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [toast,         setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const specialSurcharge  = rates.amg_surcharge;
  const timeCuttingTotal  = rates.time_cutting_rate * numCars;
  const vehicleSurcharge  = isSpecialVehicle ? specialSurcharge * numCars : 0;
  const extraTotal        = extraItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total             = timeCuttingTotal + loadPrice + lotPayment + landFee + vehicleSurcharge + extraTotal;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!customerName.trim())  e.customerName  = 'Customer name is required';
    if (!customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (numCars < 1)           e.numCars       = 'Number of cars must be at least 1';
    if (isSpecialVehicle && !vehicleName.trim()) e.vehicleName = 'Please enter the vehicle name';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildLineItems(): LineItem[] {
    const items: LineItem[] = [
      { label: `Time Cutting (${numCars} car${numCars > 1 ? 's' : ''})`, quantity: numCars, unit_price: rates.time_cutting_rate, total: timeCuttingTotal },
      { label: 'Container Load Transport', quantity: 1, unit_price: loadPrice,  total: loadPrice },
      { label: 'Container Lot Payment',    quantity: 1, unit_price: lotPayment, total: lotPayment },
      { label: 'Container Land Fee',       quantity: 1, unit_price: landFee,    total: landFee },
    ];
    if (isSpecialVehicle) {
      items.push({ label: `Special Vehicle Surcharge — ${vehicleName} (${numCars} car${numCars > 1 ? 's' : ''})`, quantity: numCars, unit_price: specialSurcharge, total: vehicleSurcharge });
    }
    extraItems.forEach(ei => {
      items.push({ label: ei.label || 'Additional item', quantity: ei.quantity, unit_price: ei.unit_price, total: ei.quantity * ei.unit_price });
    });
    return items;
  }

  async function getNextQuoteNumber(): Promise<string> {
    const supabase = createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${year}-01-01T00:00:00Z`);
    return buildQuoteNumber(count ?? 0);
  }

  async function saveQuote(status: 'draft' | 'sent') {
    const supabase    = createClient();
    const quoteNumber = await getNextQuoteNumber();
    const lineItems   = buildLineItems();

    const { data, error } = await supabase.from('quotes').insert({
      user_id:        userId,
      quote_type:     'export',
      quote_number:   quoteNumber,
      customer_name:  customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      status,
      line_items:     lineItems,
      subtotal:       total,
      total,
      notes:          notes.trim() || null,
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
      const saved      = await saveQuote('sent');
      const qrPayload  = `${window.location.origin}/quotes/${saved.id}`;
      const qrDataUrl  = await generateQRDataUrl(qrPayload);

      const supabase = createClient();
      await supabase.from('quotes').update({ qr_code_data: qrPayload }).eq('id', saved.id);

      const logoDataUrl = await fetchLogoDataUrl();
      const pdfBlob = generateQuotePDF(
        { ...saved, created_at: saved.created_at },
        company,
        qrDataUrl,
        logoDataUrl,
      );

      const base64 = await blobToBase64(pdfBlob);
      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_id: saved.id, pdf_base64: base64 }),
      });
      if (!pdfRes.ok) throw new Error('PDF generation failed');

      const urlRes = await fetch(`/api/documents/signed-url?path=quotes/${userId}/${saved.id}.pdf`);
      const { signedUrl } = await urlRes.json();

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `Quote ${saved.quote_number}`, url: signedUrl });
      } else {
        window.open(signedUrl, '_blank');
      }

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
        <Input label="Customer Name"    value={customerName}  onChange={e => setCustomerName(e.target.value)}  error={errors.customerName}  placeholder="Full name" />
        <Input label="Phone Number"     type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} error={errors.customerPhone} placeholder="+27 ..." />
        <Input label="Email (Optional)" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@example.com" />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Vehicle Details</h2>
        <Input
          label="Number of Cars"
          type="number"
          min="1"
          value={numCars}
          onChange={e => setNumCars(Math.max(1, +e.target.value))}
          error={errors.numCars}
        />
        <VehicleTypeToggle
          isSpecial={isSpecialVehicle}
          vehicleName={vehicleName}
          surcharge={specialSurcharge}
          onToggle={setIsSpecialVehicle}
          onNameChange={setVehicleName}
          error={errors.vehicleName}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide">Pricing</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex justify-between text-base">
            <span className="text-muted">Time Cutting ({numCars} car{numCars > 1 ? 's' : ''})</span>
            <span className="font-semibold text-navy">$ {timeCuttingTotal.toLocaleString()}</span>
          </div>
          {isSpecialVehicle && (
            <div className="flex justify-between text-base">
              <span className="text-muted">Special Vehicle Surcharge</span>
              <span className="font-semibold text-navy">$ {vehicleSurcharge.toLocaleString()}</span>
            </div>
          )}
        </div>
        <Input label="Container Load Transport ($)" type="number" min="0" value={loadPrice}  onChange={e => setLoadPrice(+e.target.value)}  />
        <Input label="Container Lot Payment ($)"    type="number" min="0" value={lotPayment} onChange={e => setLotPayment(+e.target.value)} />
        <Input label="Container Land Fee ($)"       type="number" min="0" value={landFee}    onChange={e => setLandFee(+e.target.value)}    />
      </section>

      <section>
        <LineItemsEditor items={extraItems} onChange={setExtraItems} />
      </section>

      <section>
        <Textarea label="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes for the customer..." />
      </section>

      <RunningTotal
        total={total}
        onSaveDraft={handleSaveDraft}
        onGeneratePDF={handleGeneratePDF}
        savingDraft={savingDraft}
        generatingPDF={generatingPDF}
      />

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
