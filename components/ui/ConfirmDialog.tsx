'use client';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', confirmVariant = 'primary', loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-base text-navy mb-6">{message}</p>
      <div className="flex flex-col gap-3">
        <Button variant={confirmVariant} loading={loading} fullWidth onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
