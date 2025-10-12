export function formatCurrency(value: number, currency = 'USD', locale = 'en-US') {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function maskId(value: string) {
  if (!value) return '';
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.length <= 4) {
    return trimmed;
  }
  return `****${trimmed.slice(-4)}`;
}
