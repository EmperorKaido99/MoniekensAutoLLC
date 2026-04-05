export type Currency = 'USD';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Alias kept for any existing usages
export const formatZAR = formatCurrency;
