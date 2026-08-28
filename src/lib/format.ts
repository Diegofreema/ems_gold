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

export const formatDate = (date: Date) => DATE.format(date)
export const formatNaira = (amount: number) => NAIRA.format(amount)
