type BadgeVariant = 'draft' | 'sent' | 'paid' | 'deed' | 'invoice' | 'quote' | 'other';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const config: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  draft:   { bg: 'bg-amber/15',   text: 'text-amber',   label: 'Draft' },
  sent:    { bg: 'bg-info/15',    text: 'text-info',    label: 'Sent' },
  paid:    { bg: 'bg-success/15', text: 'text-success', label: 'Paid' },
  deed:    { bg: 'bg-amber/15',   text: 'text-amber',   label: 'Deed of Sale' },
  invoice: { bg: 'bg-success/15', text: 'text-success', label: 'Invoice' },
  quote:   { bg: 'bg-info/15',    text: 'text-info',    label: 'Quote' },
  other:   { bg: 'bg-gray-100',   text: 'text-muted',   label: 'Other' },
};

export default function Badge({ variant, label }: BadgeProps) {
  const { bg, text, label: defaultLabel } = config[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {label ?? defaultLabel}
    </span>
  );
}
