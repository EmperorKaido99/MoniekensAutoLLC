// Document types — TypeScript interfaces for uploaded documents and AI-extracted fields
export type DocumentType = 'title' | 'deed' | 'bill-of-lading' | 'other';

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  storagePath: string;
  extractedFields: Record<string, string>;
  summary: string | null;
  createdAt: string;
}
