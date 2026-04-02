export function buildQuoteNumber(countThisYear: number): string {
  const year = new Date().getFullYear();
  return `QT-${year}-${String(countThisYear + 1).padStart(4, '0')}`;
}
