import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SegmentedControl } from '@/components/common/segmented-control'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { sheetAverage } from './grade'
import { rosterFor, SCORE_ARMS, SCORE_SUBJECTS, type Pupil } from './roster'
import { markSheet } from './mark-sheet'
import { ScoreSheet } from './score-sheet'

type Mark = 'ca' | 'exam'
/** Unsaved edits, keyed subject + arm + pupil so switching sheets keeps them. */
type Edits = Record<string, Partial<Pick<Pupil, Mark>>>

const subjectParser = parseAsStringLiteral(SCORE_SUBJECTS).withDefault(
  SCORE_SUBJECTS[0],
)
const armParser = parseAsStringLiteral(SCORE_ARMS).withDefault(SCORE_ARMS[0])

export function ScoresPage() {
  const [subject, setSubject] = useQueryState('subject', subjectParser)
  const [arm, setArm] = useQueryState('arm', armParser)
  const [edits, setEdits] = useState<Edits>({})

  const rows = useMemo(() => {
    const pupils = rosterFor(subject, arm).map((pupil) => ({
      ...pupil,
      ...edits[`${subject}|${arm}|${pupil.name}`],
    }))
    return markSheet(pupils)
  }, [subject, arm, edits])

  const average = sheetAverage(rows.map((row) => row.total))

  const setMark = (name: string, field: Mark, value: string) =>
    setEdits((previous) => {
      const key = `${subject}|${arm}|${name}`
      return { ...previous, [key]: { ...previous[key], [field]: value } }
    })

  return (
    <>
      <PageHeader
        kicker="Assessment"
        title="Enter scores"
        description="One sheet at a time. Totals compute as you type; the sheet is only submitted when you press Submit."
        action={
          <Button
            onClick={() => toast(`${subject} · ${arm} submitted for approval`)}
          >
            Submit sheet
          </Button>
        }
      />
      <Rule />

      <div className="mb-5 flex flex-wrap items-end gap-2.5">
        <Picker
          name="subject"
          label="Subject"
          options={SCORE_SUBJECTS}
          value={subject}
          onChange={(value) => void setSubject(value)}
        />
        <Picker
          name="arm"
          label="Arm"
          options={SCORE_ARMS}
          value={arm}
          onChange={(value) => void setArm(value)}
        />
        <div className="flex-1" />
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Sheet average
          </div>
          <div className="font-heading text-2xl font-extrabold tabular-nums">
            {average}
          </div>
        </div>
      </div>

      <ScoreSheet rows={rows} onMarkChange={setMark} />

      <div className="mt-3.5 text-xs text-muted-foreground">
        {rows.length} pupils · {subject} · {arm} · not yet submitted
      </div>
    </>
  )
}

function Picker<TValue extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: readonly TValue[]
  value: TValue
  onChange: (value: TValue) => void
}) {
  return (
    <div className="min-w-[200px]">
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <SegmentedControl
        name={name}
        value={value}
        onChange={onChange}
        options={options.map((option) => ({ value: option, label: option }))}
      />
    </div>
  )
}
