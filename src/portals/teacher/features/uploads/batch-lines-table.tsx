import { Tag } from '@/components/common/tag'
import { cn } from '@/lib/utils'
import { totalOf } from '../scores/grade'
import type { BatchLine } from './batch-lines'

const DASH = '—'

/** Line-by-line as the bursary read it; a flagged line sits on an accent tint. */
export function BatchLinesTable({ lines }: { lines: BatchLine[] }) {
  return (
    <div className="overflow-x-auto border-2 border-divider">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b-2 border-divider text-left">
            <Th className="w-16 text-right">Line</Th>
            <Th>Pupil</Th>
            <Th className="w-[90px] text-right">CA (30)</Th>
            <Th className="w-[100px] text-right">Exam (70)</Th>
            <Th className="w-[90px] text-right">Total</Th>
            <Th className="w-60">Problem</Th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr
              key={line.line}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'animate-ems-row border-b border-divider last:border-b-0',
                line.problem && 'bg-brand/5',
              )}
            >
              <td className="px-2 py-[11px] text-right tabular-nums text-neutral-600">
                {line.line}
              </td>
              <td className="px-2 py-[11px] font-semibold">{line.name}</td>
              <td className="px-2 py-[11px] text-right tabular-nums">
                {line.ca || DASH}
              </td>
              <td className="px-2 py-[11px] text-right tabular-nums">
                {line.exam || DASH}
              </td>
              <td className="px-2 py-[11px] text-right font-heading font-extrabold tabular-nums">
                {line.ca && line.exam ? totalOf(line.ca, line.exam) : DASH}
              </td>
              <td className="px-2 py-[11px]">
                <Tag variant={line.problem ? 'accent' : 'neutral'}>
                  {line.problem || 'None'}
                </Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'px-2 py-[11px] text-[11px] font-normal uppercase tracking-[0.06em] text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  )
}
