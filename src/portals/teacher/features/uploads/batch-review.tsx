import { useNavigate } from '@tanstack/react-router'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { BackLink } from '@/components/page/back-link'
import { SegmentedControl } from '@/components/common/segmented-control'
import { Tag } from '@/components/common/tag'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import type { Row } from '@/features/collections/types'
import { useConfirm } from '@/hooks/use-confirm'
import { toneForStatus } from '@/lib/status-tone'
import { BATCH_LINES } from './batch-lines'
import { BatchLinesTable } from './batch-lines-table'

const FILTERS = ['Problems only', 'All lines'] as const
const filterParser = parseAsStringLiteral(FILTERS).withDefault(FILTERS[0])

/**
 * Opening an upload batch shows a review of the file rather than a plain
 * record, because the decision to make is about the lines inside it.
 */
export function BatchReview({ batch }: { batch: Row }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [filter, setFilter] = useQueryState('lines', filterParser)

  const problems = BATCH_LINES.filter((line) => line.problem)
  const clean = BATCH_LINES.length - problems.length
  const shown = filter === 'Problems only' ? problems : BATCH_LINES

  const withdraw = () =>
    confirm.ask({
      title: 'Withdraw this batch?',
      body: 'The bursary stops seeing the file and none of its scores are recorded. You can upload a corrected file afterwards.',
      subject: `${batch.batch} — ${batch.file}`,
      cta: 'Withdraw the batch',
      onConfirm: () => {
        toast(`${batch.batch} withdrawn`)
        void navigate({ to: '/teacher/uploads' })
      },
    })

  return (
    <div>
      <BackLink to="/teacher/uploads" label="Back to upload batches" />

      <div className="flex flex-wrap items-start justify-between gap-[18px]">
        <div className="max-w-[60ch]">
          <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
            Assessment · Upload batches
          </div>
          <h2 className="mt-2 text-detail-title">{batch.batch}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every line the bursary read out of your file. Fix the flagged ones in
            the spreadsheet and upload it again, or accept the clean lines now
            and send the rest later.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag variant={toneForStatus(batch.state)}>{batch.state}</Tag>
            <Tag variant="outline">{batch.file}</Tag>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => toast(`${clean} lines accepted`)}>
            Accept {clean} clean lines
          </Button>
          <Button variant="outline" onClick={() => toast('Not wired up yet')}>
            Download the file
          </Button>
        </div>
      </div>
      <Rule />

      <TileStrip
        className="mb-6"
        tiles={[
          { label: 'Lines in file', value: BATCH_LINES.length },
          { label: 'Clean', value: clean },
          {
            label: 'With problems',
            value: <span className="text-brand-700">{problems.length}</span>,
          },
          { label: 'Arm', value: batch.arm },
        ]}
      />

      <SegmentedControl
        name="review-filter"
        className="mb-[18px]"
        value={filter}
        onChange={(value) => void setFilter(value)}
        options={FILTERS.map((option) => ({ value: option, label: option }))}
      />

      {shown.length === 0 ? (
        <div className="border-2 border-divider px-6 py-12 text-center">
          <div className="font-heading text-[17px] font-extrabold">
            No lines with problems
          </div>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Every line in this file can be accepted as it stands.
          </p>
        </div>
      ) : (
        <BatchLinesTable lines={shown} />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="min-w-60 flex-1 text-[12.5px] text-muted-foreground">
          {problems.length} of {BATCH_LINES.length} lines need a change in the
          spreadsheet before the bursary will approve the whole batch.
        </div>
        <Button variant="ghost" className="text-brand" onClick={withdraw}>
          Withdraw this batch
        </Button>
      </div>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}
