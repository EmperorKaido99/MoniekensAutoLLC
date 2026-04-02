import QRCode from 'qrcode';

export function buildQrPayload(type: 'quote' | 'document', id: string): string {
  return JSON.stringify({ type, id });
}

export function parseQrPayload(raw: string): { type: string; id: string } {
  return JSON.parse(raw);
}

export async function generateQRDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 300,
    margin: 1,
    color: { dark: '#1B4D73', light: '#FFFFFF' },
  });
}
