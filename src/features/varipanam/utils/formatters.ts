/**
 * Formats a numeric amount into standard Sri Lankan Rupee currency string:
 * e.g. 14750 => "Rs. 14,750.00"
 */
export function formatLKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs. 0.00'
  }
  const formatted = Math.abs(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`
}

/**
 * Formats a short currency representation (e.g. "Rs. 1.2M", "Rs. 450K")
 */
export function formatLKRCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rs. ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `Rs. ${(amount / 1_000).toFixed(1)}K`
  }
  return formatLKR(amount)
}

/**
 * Formats ISO date into human-readable council format: "21 Jan 2026"
 */
export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return 'N/A'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return String(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
