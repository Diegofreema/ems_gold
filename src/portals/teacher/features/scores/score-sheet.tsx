import { Tag } from '@/components/common/tag'
import { Input } from '@/components/ui/input'
import { toneForStatus } from '@/lib/status-tone'
import { CA_MAX, EXAM_MAX } from './grade'
import type { SheetRow } from './mark-sheet'

/**
 * The one table the design keeps on a phone: entering CA and Exam side by side
 * is the task, so the container scrolls horizontally instead of stacking.
 */
export function ScoreSheet({
  rows,
  onMarkChange,
}: {
  rows: SheetRow[]
  onMarkChange: (name: string, field: 'ca' | 'exam', value: string) => void
}) {
  return (
    <div className="overflow-x-auto border-2 border-divider">
      <table className="w-full min-w-[480px] border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b-2 border-divider text-left">
            <Th>Pupil</Th>
            <Th className="w-[120px] text-right">CA ({CA_MAX})</Th>
            <Th className="w-[120px] text-right">Exam ({EXAM_MAX})</Th>
            <Th className="w-[90px] text-right">Total</Th>
            <Th className="w-[70px]">Grade</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.name}
              style={{ animationDelay: `${index * 30}ms` }}
              className="animate-ems-row border-b border-divider last:border-b-0"
            >
              <td className="px-2 py-[11px] font-semibold">{row.name}</td>
              <MarkCell
                label={`CA for ${row.name}`}
                value={row.ca}
                onChange={(value) => onMarkChange(row.name, 'ca', value)}
              />
              <MarkCell
                label={`Exam for ${row.name}`}
                value={row.exam}
                onChange={(value) => onMarkChange(row.name, 'exam', value)}
              />
              <td className="px-2 py-[11px] text-right font-heading font-extrabold tabular-nums">
                {row.total}
              </td>
              <td className="px-2 py-[11px]">
                <Tag variant={toneForStatus(row.grade)}>{row.grade}</Tag>
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
      className={`px-2 py-[11px] text-[11px] font-normal uppercase tracking-[0.06em] text-muted-foreground ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function MarkCell({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <td className="px-2 py-[11px] text-right">
      <Input
        aria-label={label}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ml-auto w-full max-w-[84px] text-right tabular-nums"
      />
    </td>
  )
}
