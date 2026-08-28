/** Display formats shared across the portals. */

const DATE = new Intl.DateTimeFormat('en-NG', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const NAIRA = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

const COUNT = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

export const formatDate = (date: Date) => DATE.format(date)
export const formatCount = (value: number) => COUNT.format(value)
export const formatNaira = (amount: number) => NAIRA.format(amount)

/** Pulls the figure out of a display string like "₦120,000". */
export function parseNaira(display: string): number {
  return Number.parseInt(display.replace(/[^0-9]/g, ''), 10) || 0
}
