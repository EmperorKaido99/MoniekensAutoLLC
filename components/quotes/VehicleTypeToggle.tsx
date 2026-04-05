'use client';
import Input from '@/components/ui/Input';

interface Props {
  isSpecial:    boolean;
  vehicleName:  string;
  surcharge:    number;
  onToggle:     (v: boolean) => void;
  onNameChange: (name: string) => void;
  error?:       string;
}

export default function VehicleTypeToggle({ isSpecial, vehicleName, surcharge, onToggle, onNameChange, error }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-navy uppercase tracking-wide">Special Vehicle</span>
      <button
        type="button"
        onClick={() => onToggle(!isSpecial)}
        className={[
          'w-full py-3 rounded-xl font-semibold text-sm border-2 transition-colors min-h-[48px] flex items-center justify-between px-4',
          isSpecial
            ? 'bg-navy border-navy text-white'
            : 'bg-white border-gray-300 text-navy hover:border-navy',
        ].join(' ')}
      >
        <span>Special Vehicle (extra charge)</span>
        <span className={isSpecial ? 'text-amber font-bold' : 'text-muted text-xs'}>
          {isSpecial ? `+ $${surcharge.toLocaleString()}` : 'Tap to enable'}
        </span>
      </button>

      {isSpecial && (
        <Input
          label="Vehicle Name"
          value={vehicleName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Ferrari, Lamborghini, Rolls Royce..."
          error={error}
        />
      )}
    </div>
  );
}
