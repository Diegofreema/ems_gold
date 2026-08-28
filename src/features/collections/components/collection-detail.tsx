import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { SectionHeading } from '@/components/common/section-heading'
import { Tag } from '@/components/common/tag'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import { toneForStatus } from '@/lib/status-tone'
import type {
  CollectionDef,
  CollectionRoutes,
  DetailTab,
  FlowSpec,
  Row,
} from '../types'
import { fileActionToast, isFileAction } from '../file-action'
import { DetailTabPanel } from './detail-tab-panel'

/** Shown when a collection defines no sub-tables of its own. */
const ACTIVITY: DetailTab = {
  label: 'Activity',
  columns: [
    { key: 'what', label: 'What happened' },
    { key: 'when', label: 'When' },
  ],
  rows: [
    { id: 'ac-1', what: 'Record opened by you', when: 'Today, 09:12' },
    { id: 'ac-2', what: 'Edited by you', when: '18 Nov 2025, 14:03' },
    { id: 'ac-3', what: 'Seen by the head of department', when: '15 Nov 2025, 08:40' },
    { id: 'ac-4', what: 'Created', when: '02 Sep 2025, 10:21' },
  ],
}

/** One record: its figures, its sub-tables and its raw fields. */
export function CollectionDetail({
  definition,
  record,
  routes,
  flow,
}: {
  definition: CollectionDef
  record: Row
  routes: CollectionRoutes
  flow?: FlowSpec
}) {
  const navigate = useNavigate()
  const editRoute = routes.edit
  const flowRoute = routes.flow

  const tagColumns = definition.columns.filter((column) => column.tag)
  const statColumns = definition.columns
    .filter((column) => column.align === 'right')
    .slice(0, 3)

  return (
    <div>
      <Button asChild variant="ghost" className="mb-3.5 px-1 text-brand">
        <Link to={definition.path}>
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to {definition.title.toLowerCase()}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-[18px]">
        <div className="max-w-[60ch]">
          <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
            {definition.kicker} · {definition.title}
          </div>
          <h2 className="mt-2 text-detail-title">{record[definition.nameKey]}</h2>
          {tagColumns.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tagColumns.map((column) => (
                <Tag key={column.key} variant={toneForStatus(record[column.key])}>
                  {record[column.key]}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {!editRoute ? (
            <Button
              onClick={() =>
                toast(
                  isFileAction(definition.action)
                    ? fileActionToast(definition.action)
                    : `${definition.action} — requested`,
                )
              }
            >
              {definition.action}
            </Button>
          ) : (
            <>
              <Button
                onClick={() =>
                  navigate({
                    to: editRoute,
                    params: { collection: definition.id, recordId: record.id },
                  })
                }
              >
                <Pencil className="size-[15px]" strokeWidth={2} />
                Edit
              </Button>
              {flowRoute && flow && (
                <Button asChild variant="outline">
                  <Link
                    to={flowRoute}
                    params={{ collection: definition.id }}
                    search={{ record: record.id }}
                  >
                    {flow.label}
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={() => toast('Not wired up yet')}>
                {definition.kicker === 'Finance' ? 'Print' : 'Export'}
              </Button>
            </>
          )}
        </div>
      </div>
      <Rule />

      {statColumns.length > 0 && (
        <TileStrip
          className="mb-7"
          tiles={statColumns.map((column) => ({
            label: column.label,
            value: record[column.key],
          }))}
        />
      )}

      <div className="grid gap-[34px] lg:grid-cols-[1.6fr_1fr]">
        <DetailTabPanel tabs={definition.tabs ?? [ACTIVITY]} />

        <aside>
          <SectionHeading className="mb-3.5">Record</SectionHeading>
          <div className="border-t-2 border-divider">
            {definition.columns.map((column) => (
              <div
                key={column.key}
                className="flex gap-3.5 border-b border-divider px-0.5 py-[11px]"
              >
                <div className="w-[45%] text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {column.label}
                </div>
                <div className="flex-1 text-[13.5px] tabular-nums">
                  {record[column.key]}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
