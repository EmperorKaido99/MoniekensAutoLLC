/**
 * Downloads a Blob as a file on the user's device.
 * Uses a hidden <a download> anchor — no new tab opened.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Fetches the company logo and returns it as a data URL for jsPDF.
 * Returns undefined on any failure so callers can render without a logo.
 */
export async function fetchLogoDataUrl(path = '/images/Logo.png'): Promise<string | undefined> {
  try {
    const res = await fetch(path);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/**
 * Converts a Blob to a bare base64 string (no data: prefix).
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fire-and-forget: POSTs the base64 PDF to /api/generate-pdf.
 * Never throws — errors are only logged.
 */
export function uploadQuotePdfInBackground(quoteId: string, blob: Blob): void {
  blobToBase64(blob)
    .then((base64) =>
      fetch('/api/generate-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quote_id: quoteId, pdf_base64: base64 }),
      })
    )
    .then((res) => {
      if (!res.ok) console.error('uploadQuotePdfInBackground: upload failed', res.status);
    })
    .catch((err) => {
      console.error('uploadQuotePdfInBackground:', err);
    });
}
