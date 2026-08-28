import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Row } from '@/features/collections/types'
import { amountInWords, parseNaira } from './amount-in-words'

/** The printable official receipt: letterhead, figure, words, then the rows. */
export function ReceiptView({ receipt }: { receipt: Row }) {
  const amount = parseNaira(receipt.amount)

  const fields = [
    { label: 'Received from', value: 'Mr & Mrs Udo' },
    { label: 'On behalf of', value: receipt.child },
    { label: 'For', value: receipt.fee },
    { label: 'Method', value: receipt.method },
    { label: 'Date', value: receipt.date },
    { label: 'Session', value: '2025/2026 · First Term' },
  ]

  return (
    <div className="max-w-[640px]">
      <Button asChild variant="ghost" className="mb-3.5 px-1 text-brand">
        <Link to="/parent/receipts">
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to receipts
        </Link>
      </Button>

      <article className="border-2 border-foreground">
        <header className="flex items-start gap-4 border-b-2 border-foreground px-6 py-[22px]">
          <div className="size-[26px] flex-none bg-brand" aria-hidden />
          <div className="flex-1">
            <div className="font-heading text-base font-extrabold">
              NETPRO EMS Bronze
            </div>
            <div className="mt-[3px] text-[11.5px] text-muted-foreground">
              12 Awolowo Road, Ikoyi, Lagos · RC 442901
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Official receipt
            </div>
            <div className="mt-1 font-heading text-[19px] font-extrabold">
              {receipt.receipt}
            </div>
          </div>
        </header>

        <div className="border-b-2 border-divider p-6">
          <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Amount received
          </div>
          <div className="mt-1.5 font-heading text-receipt font-extrabold tracking-[-0.02em] tabular-nums">
            ₦{amount.toLocaleString('en-NG')}
          </div>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            {amountInWords(amount)}
          </div>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.label}
            style={{ animationDelay: `${index * 26}ms` }}
            className="flex animate-ems-row gap-4 border-b border-divider px-6 py-3"
          >
            <div className="w-2/5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {field.label}
            </div>
            <div className="flex-1 text-sm tabular-nums">{field.value}</div>
          </div>
        ))}

        <footer className="flex flex-wrap items-end justify-between gap-5 px-6 py-5">
          <div className="max-w-[34ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Computer generated. Valid without a signature. Query any receipt
            with the bursary within thirty days.
          </div>
          <div className="text-right">
            <div className="w-[130px] border-b-2 border-foreground" />
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              Bursar
            </div>
          </div>
        </footer>
      </article>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button onClick={() => toast('Not wired up yet')}>Download PDF</Button>
        <Button variant="outline" onClick={() => toast('Not wired up yet')}>
          Email it to me
        </Button>
      </div>
    </div>
  )
}
