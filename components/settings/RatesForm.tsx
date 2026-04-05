'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RateSettings, CompanySettings } from '@/types/settings';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

interface Props {
  initialRates:        RateSettings;
  initialCompany:      CompanySettings;
  userId:              string;
  hasExistingRates:    boolean;
  hasExistingCompany:  boolean;
}

export default function RatesForm({ initialRates, initialCompany, userId, hasExistingRates, hasExistingCompany }: Props) {
  const [rates,        setRates]        = useState<RateSettings>(initialRates);
  const [company,      setCompany]      = useState<CompanySettings>(initialCompany);
  const [savingRates,  setSavingRates]  = useState(false);
  const [savingCo,     setSavingCo]     = useState(false);
  const [ratesSaved,   setRatesSaved]   = useState(false);
  const [coSaved,      setCoSaved]      = useState(false);

  function setRate(key: keyof RateSettings, val: number) {
    setRates(r => ({ ...r, [key]: val }));
  }
  function setCompanyField(key: keyof CompanySettings, val: string) {
    setCompany(c => ({ ...c, [key]: val }));
  }

  async function handleSaveRates() {
    setSavingRates(true);
    const supabase = createClient();
    if (hasExistingRates) {
      await supabase.from('rate_settings').update({ ...rates, updated_at: new Date().toISOString() }).eq('user_id', userId);
    } else {
      await supabase.from('rate_settings').insert({ ...rates, user_id: userId });
    }
    setSavingRates(false);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 3000);
  }

  async function handleSaveCompany() {
    setSavingCo(true);
    const supabase = createClient();
    if (hasExistingCompany) {
      await supabase.from('company_settings').update({ ...company, updated_at: new Date().toISOString() }).eq('user_id', userId);
    } else {
      await supabase.from('company_settings').insert({ ...company, user_id: userId });
    }
    setSavingCo(false);
    setCoSaved(true);
    setTimeout(() => setCoSaved(false), 3000);
  }

  const rateFields: { key: keyof RateSettings; label: string }[] = [
    { key: 'amg_surcharge',         label: 'Special Vehicle Surcharge ($)' },
    { key: 'base_towing_fee',       label: 'Base Towing Fee ($)' },
    { key: 'time_cutting_rate',     label: 'Time Cutting Rate per Car ($)' },
    { key: 'container_load_price',  label: 'Container Load Transport Price ($)' },
    { key: 'container_lot_payment', label: 'Container Lot Payment ($)' },
    { key: 'container_land_fee',    label: 'Container Land Fee ($)' },
  ];

  return (
    <div className="px-4 py-5 space-y-6 pb-12">
      {/* Rates section */}
      <section>
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-4">Rate & Fee Settings</h2>
        <Card className="space-y-4">
          {rateFields.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              type="number"
              min="0"
              step="0.01"
              value={rates[key] as number}
              onChange={e => setRate(key, +e.target.value)}
            />
          ))}
        </Card>
        <div className="mt-4">
          <Button variant="primary" size="lg" fullWidth loading={savingRates} onClick={handleSaveRates}>
            {ratesSaved ? <><CheckCircle size={18} /> Rates Saved</> : 'Save Rates'}
          </Button>
        </div>
      </section>

      {/* Company section */}
      <section>
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-4">Company Settings</h2>
        <Card className="space-y-4">
          <Input label="Company Name"    value={company.company_name}    onChange={e => setCompanyField('company_name', e.target.value)}    placeholder="MoniekensAutoLLC" />
          <Input label="Phone Number"    type="tel" value={company.company_phone}   onChange={e => setCompanyField('company_phone', e.target.value)}   placeholder="+27 ..." />
          <Input label="Email Address"   type="email" value={company.company_email}   onChange={e => setCompanyField('company_email', e.target.value)}   placeholder="info@example.com" />
          <Input label="Address"         value={company.company_address} onChange={e => setCompanyField('company_address', e.target.value)} placeholder="Street, City, Province" />
        </Card>
        <div className="mt-4">
          <Button variant="primary" size="lg" fullWidth loading={savingCo} onClick={handleSaveCompany}>
            {coSaved ? <><CheckCircle size={18} /> Company Saved</> : 'Save Company Details'}
          </Button>
        </div>
      </section>
    </div>
  );
}
