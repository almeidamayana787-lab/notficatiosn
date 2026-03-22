/** Parse entrada estilo BR: "150,50", "1.234,56" */
export function parseBRLInput(s: string): number | null {
  const t = s.trim().replace(/\s/g, '');
  if (!t) return null;
  const normalized = t.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0 || n > 99_999_999.99) return null;
  return Math.round(n * 100) / 100;
}

export function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(n);
}
