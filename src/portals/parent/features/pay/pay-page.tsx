import { useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'
import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { SegmentedControl } from '@/components/common/segmented-control'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirm } from '@/hooks/use-confirm'
import { amountInWords } from '@/lib/amount-words'
import { formatNaira } from '@/lib/format'
import { cn } from '@/lib/utils'
import { outstandingFor, PAY_METHODS } from './outstanding'
import { useFamily } from '../../parent.store'

const methodParser = parseAsStringLiteral(PAY_METHODS).withDefault(
  PAY_METHODS[0],
)

export function PayPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const outstanding = outstandingFor(useFamily())
  const [method, setMethod] = useQueryState('method', methodParser)
  // Empty rather than the first invoice: the default is read once, and the
  // list is fetched, so a default built from it would stick at whatever the
  // first render happened to hold.
  const [invoiceId, setInvoiceId] = useQueryState('invoice', parseAsString.withDefault(''))

  const chosen =
    outstanding.find((entry) => entry.id === invoiceId) ?? outstanding[0]
  // Part payments are allowed, so the amount starts at the balance and is
  // then the parent's to change. Held unformatted — the field puts the
  // separators on, and `payable` puts them back for the copy that reads it.
  const [amount, setAmount] = useState(String(chosen?.balanceValue ?? 0))
  const words = amountInWords(amount)
  const payable = formatNaira(Number(amount) || 0)

  const pick = (id: string) => {
    void setInvoiceId(id)
    const next = outstanding.find((entry) => entry.id === id)
    if (next) setAmount(String(next.balanceValue))
  }

  const pay = () =>
    confirm.ask({
      title: 'Send this payment?',
      body: 'The school is charged as soon as this clears. A refund has to go through the bursary, so check the invoice and the amount first.',
      subject: `${payable} by ${method}${chosen ? ` · ${chosen.invoice}` : ''}`,
      cancel: 'Go back',
      cta: 'Pay now',
      onConfirm: () => {
        toast(`Payment of ${payable} initiated — receipt follows`)
        void navigate({ to: '/parent/invoices' })
      },
    })

  return (
    <div className="max-w-[680px]">
      <PageHeader
        kicker="Finance"
        title="Pay fees"
        description="One invoice at a time. Pick the invoice, choose how you are paying, and the receipt is issued as soon as the payment clears."
      />
      <Rule />

      <div className="mb-5">
        <Label className="mb-[5px] block text-xs font-normal text-foreground/70">
          Invoice
        </Label>
        <div
          role="radiogroup"
          aria-label="Invoice"
          className="flex flex-col overflow-hidden border-2 border-divider bg-background"
        >
          {outstanding.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={entry.id === chosen?.id}
              onClick={() => pick(entry.id)}
              className={cn(
                'flex cursor-pointer items-center gap-3.5 border-b-2 border-divider px-4 py-3.5 text-left text-sm transition-colors last:border-b-0 hover:bg-neutral-200',
                entry.id === chosen?.id ? 'bg-brand/10' : 'bg-background',
              )}
            >
              <span
                className={cn(
                  'size-[18px] flex-none rounded-full border-2',
                  entry.id === chosen?.id
                    ? 'border-brand bg-brand'
                    : 'border-divider bg-transparent',
                )}
              />
              <span className="flex-1">
                <span className="font-semibold">{entry.fee}</span>
                <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                  {entry.child} · {entry.invoice}
                </span>
              </span>
              <span className="font-heading font-extrabold tabular-nums">
                {entry.balance}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <Label className="mb-[5px] block text-xs font-normal text-foreground/70">
          How are you paying?
        </Label>
        <SegmentedControl
          name="method"
          value={method}
          onChange={(value) => void setMethod(value)}
          options={PAY_METHODS.map((entry) => ({ value: entry, label: entry }))}
        />
      </div>

      <div className="mb-[22px] max-w-[260px]">
        <Label
          htmlFor="amount"
          className="mb-[5px] block text-xs font-normal text-foreground/70"
        >
          Amount to pay
        </Label>
        <NumericFormat
          customInput={Input}
          id="amount"
          value={amount}
          onValueChange={(values) => setAmount(values.value)}
          thousandSeparator=","
          decimalScale={2}
          allowNegative={false}
          inputMode="decimal"
          className="text-right font-heading text-lg font-extrabold tabular-nums"
        />
        {/* The figure spelled out sits above the balance rather than replacing
            it: paying part of an invoice is a decision that needs both. */}
        {words && (
          <div className="mt-1 text-[11px] text-foreground/70">{words}</div>
        )}
        <div className="mt-1 text-[11px] text-muted-foreground">
          {chosen
            ? `Balance on ${chosen.invoice} is ${chosen.balance}. Part payments are allowed.`
            : 'Nothing outstanding.'}
        </div>
      </div>
      <Rule />

      <div className="flex flex-wrap items-center gap-2.5">
        {/* An emptied field used to leave a live "Pay ₦0" button behind it. */}
        <Button onClick={pay} disabled={!chosen || !Number(amount)}>
          Pay {payable} by {method}
        </Button>
        <Button asChild variant="outline">
          <Link to="/parent/invoices">See all invoices</Link>
        </Button>
      </div>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}
