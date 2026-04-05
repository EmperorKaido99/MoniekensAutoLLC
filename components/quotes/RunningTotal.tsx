'use client';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import Button from '@/components/ui/Button';

interface Props {
  total:        number;
  onSaveDraft:  () => void;
  onGeneratePDF: () => void;
  savingDraft:  boolean;
  generatingPDF: boolean;
}

export default function RunningTotal({ total, onSaveDraft, onGeneratePDF, savingDraft, generatingPDF }: Props) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 pt-3 pb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-muted uppercase tracking-wide">Grand Total</span>
        <span className="text-2xl font-bold text-navy">{formatCurrency(total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={onSaveDraft}
          loading={savingDraft}
          disabled={generatingPDF}
          fullWidth
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onGeneratePDF}
          loading={generatingPDF}
          disabled={savingDraft}
          fullWidth
        >
          Generate PDF
        </Button>
      </div>
    </div>
  );
}
