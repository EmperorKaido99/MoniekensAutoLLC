// Quote types — TypeScript interfaces for all quote variants and shared fields
export type QuoteType = 'export' | 'container' | 'towing';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface Quote {
  id: string;
  type: QuoteType;
  status: QuoteStatus;
  customerId: string;
  vehicleDescription: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
