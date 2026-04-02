'use client';
import type { VehicleType } from '@/types/quote';

interface Props {
  value: VehicleType | '';
  onChange: (type: VehicleType) => void;
  label?: string;
}

const OPTIONS: { type: VehicleType; label: string }[] = [
  { type: 'amg',    label: 'AMG' },
  { type: 'suv',    label: 'SUV' },
  { type: 'pickup', label: 'Pickup Truck' },
];

export default function VehicleTypeToggle({ value, onChange, label = 'Vehicle Type' }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-navy uppercase tracking-wide">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ type, label: optLabel }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={[
              'py-3 rounded-xl font-semibold text-sm border-2 transition-colors min-h-[48px]',
              value === type
                ? 'bg-navy border-navy text-white'
                : 'bg-white border-gray-300 text-navy hover:border-navy',
            ].join(' ')}
          >
            {optLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
