import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Tag } from '@/components/common/tag'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { RECEIPT_REFERENCE } from './paper'

/** Proof the paper reached the school. Reachable by URL so it can be re-opened. */
export function TestReceipt({ answered }: { answered: number }) {
  const fields = [
    { label: 'Paper', value: 'Computer Studies — First Term test' },
    { label: 'Pupil', value: 'Amara Okeke · NEB/2022/0871' },
    { label: 'Submitted', value: 'Today, 09:26' },
    { label: 'Answered', value: `${answered} of 30 questions` },
    { label: 'Marked by', value: 'The system, on the closing date' },
  ]

  return (
    <div className="max-w-[620px]">
      <div className="grid size-10 place-items-center bg-brand text-white">
        <Check className="size-[22px]" strokeWidth={2.4} />
      </div>
      <h2 className="mt-5 text-detail-title">Your test was submitted</h2>
      <p className="mt-2.5 text-sm text-muted-foreground">
        Keep this reference. It is proof the paper reached the school if
        anything is ever queried.
      </p>
      <Rule />

      <div className="border-2 border-foreground">
        <div className="flex flex-wrap items-baseline gap-3 border-b-2 border-divider px-5 py-[18px]">
          <div className="flex-1 font-heading text-[22px] font-extrabold tracking-[-0.01em]">
            {RECEIPT_REFERENCE}
          </div>
          <Tag>Received</Tag>
        </div>
        {fields.map((field, index) => (
          <div
            key={field.label}
            style={{ animationDelay: `${index * 30}ms` }}
            className="flex animate-ems-row gap-4 border-b border-divider px-5 py-3 last:border-b-0"
          >
            <div className="w-[44%] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {field.label}
            </div>
            <div className="flex-1 text-sm tabular-nums">{field.value}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        Results appear on your results page once your teacher has approved them.
        Blank answers are marked zero.
      </p>
      <Rule />

      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <Link to="/student/tests">Back to my tests</Link>
        </Button>
        <Button variant="outline" onClick={() => toast('Not wired up yet')}>
          Download the receipt
        </Button>
      </div>
    </div>
  )
}
