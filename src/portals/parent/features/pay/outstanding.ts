import { parseNaira } from '@/lib/format'
import type { Child } from '../../family'

export type OutstandingInvoice = {
  id: string
  child: string
  fee: string
  invoice: string
  balance: string
  balanceValue: number
}

/** Every invoice with something still to pay, across every child on the record. */
export function outstandingFor(family: Child[]): OutstandingInvoice[] {
  return family.flatMap((child) =>
    child.invoices
      .filter((invoice) => parseNaira(invoice.balance) > 0)
      .map((invoice) => ({
        id: invoice.invoice,
        child: child.full,
        fee: invoice.fee,
        invoice: invoice.invoice,
        balance: invoice.balance,
        balanceValue: parseNaira(invoice.balance),
      })),
  )
}

export const PAY_METHODS = ['Remita (RRR)', 'Bank transfer', 'Card'] as const
export type PayMethod = (typeof PAY_METHODS)[number]
