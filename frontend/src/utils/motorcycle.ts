/**
 * Format motorcycle display name from brand + model,
 * filtering out placeholder values like "ไม่ระบุ" from legacy data.
 */
export function formatMotorcycleName(brand?: string | null, model?: string | null): string {
  return [brand, model]
    .filter(v => v && v !== 'ไม่ระบุ')
    .join(' ')
    .trim() || '-'
}
