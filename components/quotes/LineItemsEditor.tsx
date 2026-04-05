'use client';
import { Plus, Trash2 } from 'lucide-react';
import { formatZAR } from '@/lib/utils/formatCurrency';

export interface ExtraItem {
  label:      string;
  quantity:   number;
  unit_price: number;
}

interface Props {
  items:    ExtraItem[];
  onChange: (items: ExtraItem[]) => void;
}

export default function LineItemsEditor({ items, onChange }: Props) {
  const add = () =>
    onChange([...items, { label: '', quantity: 1, unit_price: 0 }]);

  const remove = (i: number) =>
    onChange(items.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof ExtraItem, val: string | number) => {
    const next = items.map((item, idx) =>
      idx === i ? { ...item, [field]: val } : item
    );
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy uppercase tracking-wide">
          Additional Items
        </span>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-amber text-sm font-semibold min-h-[44px] px-2"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-muted text-sm text-center py-2">No additional items</p>
      )}

      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-2">
          <input
            placeholder="Description"
            value={item.label}
            onChange={e => update(i, 'label', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <div className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
            <div>
              <label className="text-xs text-muted mb-1 block">Qty</label>
              <input
                type="number"
                min="1"
                value={item.quantity || ''}
                onChange={e => update(i, 'quantity', +e.target.value)}
                onBlur={e => { if (!e.target.value || +e.target.value < 1) update(i, 'quantity', 1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">
                Unit Price — {formatZAR(item.quantity * item.unit_price)}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price || ''}
                onChange={e => update(i, 'unit_price', +e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="self-end mb-0.5 flex items-center justify-center w-10 h-10 rounded-lg text-danger hover:bg-danger/10 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
