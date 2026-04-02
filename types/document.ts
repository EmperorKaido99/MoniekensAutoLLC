export type DocumentType = 'deed_of_sale' | 'invoice' | 'quote' | 'other';

export interface VaultDocument {
  id:            string;
  user_id:       string;
  customer_name: string;
  car_make?:     string;
  car_model?:    string;
  car_year?:     number;
  car_price?:    number;
  document_type: DocumentType;
  file_path:     string;
  file_name:     string;
  qr_code_data?: string;
  notes?:        string;
  uploaded_at:   string;
}

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  deed_of_sale: 'Deed of Sale',
  invoice:      'Invoice',
  quote:        'Quote',
  other:        'Other',
};
