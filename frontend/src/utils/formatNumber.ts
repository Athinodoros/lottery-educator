export function formatNumber(value: number, lng: string): string {
  try {
    return new Intl.NumberFormat(lng).format(value)
  } catch {
    return value.toLocaleString()
  }
}

export function formatCurrency(value: number, lng: string, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(lng, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `$${value.toLocaleString()}`
  }
}
