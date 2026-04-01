// QR utilities — generates and parses QR code payloads for vehicles and documents
export function buildQrPayload(type: 'quote' | 'document', id: string): string {
  return JSON.stringify({ type, id });
}

export function parseQrPayload(raw: string): { type: string; id: string } {
  return JSON.parse(raw);
}
