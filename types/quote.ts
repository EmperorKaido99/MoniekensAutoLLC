export type QuoteType   = 'export' | 'container' | 'towing';
export type QuoteStatus = 'draft' | 'sent' | 'paid';
export type VehicleType = 'amg' | 'suv' | 'pickup';

export interface LineItem {
  label:      string;
  quantity:   number;
  unit_price: number;
  total:      number;
}

export interface Quote {
  id:             string;
  user_id:        string;
  quote_type:     QuoteType;
  quote_number:   string;
  customer_name:  string;
  customer_phone: string;
  customer_email?: string;
  status:         QuoteStatus;
  line_items:     LineItem[];
  subtotal:       number;
  total:          number;
  notes?:         string;
  pdf_url?:       string;
  qr_code_data?:  string;
  created_at:     string;
  updated_at:     string;
}
