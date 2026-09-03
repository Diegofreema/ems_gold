import { SegmentedControl } from '@/components/common/segmented-control'
import { Input } from '@/components/ui/input'
import { BLANK } from '@/features/collections/blank'
import type { RegisterRow, StatusOption } from './register'

/**
 * The roll: one row per student, the school's own words to mark them with, and a
 * note beside it.
 *
 * A student nobody has marked shows no selected word and says "Not marked" —
 * never a pre-ticked Present, which would make an untaken register read as a
 * day when everybody turned up.
 */
export function RegisterSheet({
  rows,
  statuses,
  onMark,
  onNote,
}: {
  rows: RegisterRow[]
  statuses: StatusOption[]
  onMark: (studentId: number, status: string) => void
  onNote: (studentId: number, notes: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/60 bg-raised">
      <table className="w-full min-w-170 border-collapse text-sm">
        <thead>
          <tr className="border-b border-divider-strong text-left">
            <Th>Student</Th>
            <Th>Mark</Th>
            <Th className="w-60">Note</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.student_id}
              style={{ animationDelay: `${index * 30}ms` }}
              className="animate-ems-row border-b border-divider last:border-b-0"
            >
              <td className="px-2 py-2.75">
                <div className="font-semibold">{row.name}</div>
                <div className="mt-0.5 text-2xs text-muted-foreground">
                  {row.regno || BLANK}
                  {!row.status && <span> · Not marked</span>}
                  {row.edited && <span className="text-brand"> · Unsaved</span>}
                </div>
              </td>
              <td className="px-2 py-2.75">
                {/* A fieldset so the radios read as one group per student: the
                    control itself takes no label, and "Present" alone tells a
                    screen reader nothing about whose mark it is. */}
                <fieldset>
                  <legend className="sr-only">Mark for {row.name}</legend>
                  <SegmentedControl
                    name={`mark-${row.student_id}`}
                    value={row.status ?? ''}
                    options={statuses}
                    onChange={(status) => onMark(row.student_id, status)}
                  />
                </fieldset>
              </td>
              <td className="px-2 py-2.75">
                <Input
                  aria-label={`Note for ${row.name}`}
                  value={row.notes}
                  placeholder="Optional"
                  onChange={(event) => onNote(row.student_id, event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-2 py-2.75 text-2xs font-normal uppercase tracking-label text-muted-foreground ${className ?? ''}`}
    >
      {children}
    </th>
  )
}
