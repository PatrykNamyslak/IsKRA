/**
 * Standardowa, stabilna funkcja do tworzenia slugów URL.
 * Wykorzystuje natywną normalizację Unicode (NFKD) do transliteracji znaków diakrytycznych.
 */
export function slugify(val: string): string {
  if (!val) return ''

  return val
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
