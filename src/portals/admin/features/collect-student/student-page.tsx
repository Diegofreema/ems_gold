import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'
import { collectFeeKeys } from '@/api/collect-fees/keys'
import { collectFeesService } from '@/api/collect-fees/service'
import { BackLink } from '@/components/page/back-link'
import { SegmentedControl } from '@/components/common/segmented-control'
import { DataTable } from '@/components/data-table/data-table'
import { EmptyState } from '@/components/feedback/empty-state'
import { TableSkeleton } from '@/components/feedback/table-skeleton'
import { FilterBar } from '@/components/page/filter-bar'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import { toTableColumns } from '@/features/collections/components/collection-columns'
import type { Row } from '@/features/collections/types'
import { useDebounced } from '@/hooks/use-debounced'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import {
  ledgerRow,
  studentHeading,
  studentResult,
  studentSubtitle,
  studentTiles,
} from './student'

const RESULTS = toTableColumns([
  { key: 'name', label: 'Student', cardRole: 'title' },
  { key: 'regno', label: 'Reg. no.', cardRole: 'subtitle' },
  { key: 'placed', label: 'Class' },
])

const LEDGER = toTableColumns([
  { key: 'invoice', label: 'Invoice', cardRole: 'subtitle' },
  { key: 'fee', label: 'Fee', cardRole: 'title' },
  { key: 'session', label: 'Session' },
  { key: 'billed', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
])

const SCOPES = ['session', 'all'] as const
type Scope = (typeof SCOPES)[number]

const rowKey = (row: Row) => row.id

/**
 * Everything one student has been billed, settled or not.
 *
 * The counter queue answers "who owes what" and cannot see a student who owes
 * nothing or a payment already taken. This is where a family's history is, and
 * it is the only way to reach a receipt for a payment that has been made.
 */
export function StudentLookupPage() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [student, setStudent] = useQueryState('student', parseAsString.withDefault(''))
  const [scope, setScope] = useQueryState(
    'scope',
    parseAsStringLiteral(SCOPES).withDefault('session'),
  )

  const header = (
    <>
      <BackLink to="/admin/collect" label="Back to fee collection" />
      <PageHeader
        kicker="Finance · Fee collection"
        title="Find a student"
        description="Everything one student has been billed, settled or not. The queue lists only what is owed — a family's history and their receipts are here."
      />
      <Rule />
    </>
  )

  return (
    <div className="max-w-[900px]">
      {header}
      {student ? (
        <>
          <Button
            variant="outline"
            className="mb-5.5"
            onClick={() => void setStudent(null)}
          >
            Search for someone else
          </Button>
          <StudentLedger
            studentId={student}
            scope={scope}
            onScope={(next) => void setScope(next)}
          />
        </>
      ) : (
        <StudentSearch
          query={query}
          onQuery={(value) => void setQuery(value || null)}
          onPick={(id) => void setStudent(id)}
        />
      )}
    </div>
  )
}

function StudentSearch({
  query,
  onQuery,
  onPick,
}: {
  query: string
  onQuery: (value: string) => void
  onPick: (id: string) => void
}) {
  // The endpoint answers 422 without a term, so nothing is asked until one is
  // typed — and then only once the typing stops.
  const term = useDebounced(query)
  const { data, isPending, error, refetch } = useQuery({
    queryKey: collectFeeKeys.studentSearch({ q: term }),
    queryFn: () => collectFeesService.findStudents({ q: term }),
    enabled: Boolean(term),
  })

  return (
    <>
      <FilterBar
        query={query}
        onQueryChange={onQuery}
        placeholder="Search student name or reg. no."
        count={data ? `${data.length} found` : ''}
      />

      {!term ? (
        <EmptyState
          title="Search for a student"
          body="Type a name or a registration number. Students who owe nothing are found here too."
        />
      ) : error ? (
        <EmptyState
          title="That search could not run"
          body={errorMessage(error, OFFLINE_MESSAGE)}
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      ) : isPending ? (
        <TableSkeleton rows={4} />
      ) : data.length === 0 ? (
        <EmptyState
          title={`Nobody matches “${term}”`}
          body="Check the spelling, or try the registration number instead of the name."
        />
      ) : (
        <DataTable
          columns={RESULTS}
          rows={data.map(studentResult)}
          rowKey={rowKey}
          onRowClick={(row) => onPick(row.id)}
          compact
        />
      )}
    </>
  )
}

function StudentLedger({
  studentId,
  scope,
  onScope,
}: {
  studentId: string
  scope: Scope
  onScope: (next: Scope) => void
}) {
  const navigate = useNavigate()
  const { data, isPending, error, refetch } = useQuery({
    queryKey: collectFeeKeys.ledger(studentId, scope === 'all'),
    queryFn: () => collectFeesService.studentLedger(studentId, scope === 'all'),
    // Widening to every session keeps the student's name and figures on screen
    // rather than dropping the whole panel back to a skeleton for one request.
    placeholderData: keepPreviousData,
  })

  if (error) {
    return (
      <EmptyState
        title="That student could not be loaded"
        body={errorMessage(error, OFFLINE_MESSAGE)}
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    )
  }
  if (isPending) return <TableSkeleton rows={5} />

  const { student, invoices } = data

  return (
    // The page swaps wholesale from the search to this ledger on a pick, so
    // the entrance says "you moved somewhere" rather than the rows jumping.
    <div className="animate-ems-up">
      <div className="mb-4.5">
        <h2 className="text-detail-title">{studentHeading(student)}</h2>
        <div className="mt-1.5 text-xs text-muted-foreground">
          {studentSubtitle(student)}
        </div>
      </div>

      <TileStrip className="mb-5" tiles={studentTiles(invoices)} />

      <SegmentedControl<Scope>
        name="scope"
        className="mb-4.5"
        value={scope}
        onChange={onScope}
        options={[
          { value: 'session', label: 'This session' },
          { value: 'all', label: 'Every session' },
        ]}
      />

      <DataTable
        columns={LEDGER}
        rows={invoices.map(ledgerRow)}
        rowKey={rowKey}
        action={{
          // One button, two jobs. An invoice still owing goes to the payment
          // flow; a payment already recorded goes to its slip. An invoice
          // settled before the counter kept transactions has neither — it gets
          // no button rather than one that answers 404.
          label: (row) =>
            row.payable ? 'Take payment' : row.receipt ? 'Receipt' : undefined,
          onSelect: (row) =>
            void navigate(
              row.payable
                ? {
                    to: '/admin/$collection/action',
                    params: { collection: 'collect' },
                    search: { record: row.payable },
                  }
                : {
                  to: '/admin/collect/receipt/$invoiceId',
                  params: { invoiceId: row.receipt },
                },
            ),
        }}
        compact
      />

      <div className="mt-2.5 text-xs text-muted-foreground">
        {invoices.length === 0
          ? scope === 'all'
            ? 'Nothing has ever been billed to this student.'
            : 'Nothing has been billed to this student this session.'
          : `${invoices.length} ${invoices.length === 1 ? 'invoice' : 'invoices'}, newest first`}
      </div>
    </div>
  )
}
