import { CHILDREN } from '../../children'
import { parseNaira } from '../receipts/amount-in-words'

export type OutstandingInvoice = {
  id: string
  child: string
  fee: string
  invoice: string
  balance: string
  balanceValue: number
  /** The balance as it first appears in the amount field, e.g. "85,000". */
  amountDraft: string
}

/** Every invoice with something still to pay, across both children. */
export const OUTSTANDING: OutstandingInvoice[] = CHILDREN.flatMap((child) =>
  child.invoices
    .filter((invoice) => parseNaira(invoice.balance) > 0)
    .map((invoice) => ({
      id: invoice.invoice,
      child: child.full,
      fee: invoice.fee,
      invoice: invoice.invoice,
      balance: invoice.balance,
      balanceValue: parseNaira(invoice.balance),
      amountDraft: invoice.balance.replace('₦', ''),
    })),
)

export const PAY_METHODS = ['Remita (RRR)', 'Bank transfer', 'Card'] as const
export type PayMethod = (typeof PAY_METHODS)[number]
