import { Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { EmptyState } from '@/components/feedback/empty-state'
import { DataTable } from '@/components/data-table/data-table'
import { Pagination } from '@/components/data-table/pagination'
import { FilterBar } from '@/components/page/filter-bar'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/hooks/use-confirm'
import type { AdminCollectionId } from '../collections'
import type { CollectionDef, Row } from '../collections/types'
import { useCollectionRows } from '../hooks/use-collection-rows'
import { toTableColumns } from './collection-columns'

export function CollectionList({ definition }: { definition: CollectionDef }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { query, page, setQuery, setPage, total, paged } = useCollectionRows(
    definition.id as AdminCollectionId,
  )

  const open = (row: Row) =>
    navigate({
      to: '/admin/$collection/$recordId',
      params: { collection: definition.id, recordId: row.id },
    })

  const askDelete = (row: Row) =>
    confirm.ask({
      title: `Delete this ${definition.noun}?`,
      body: `This removes the record from the register. Anything already raised against it stays in the audit log.`,
      subject: row[definition.nameKey],
      cta: `Delete the ${definition.noun}`,
      onConfirm: () => toast(`${row[definition.nameKey]} deleted`),
    })

  return (
    <>
      <PageHeader
        kicker={definition.kicker}
        title={definition.title}
        description={definition.description}
        action={
          <Button asChild>
            <Link
              to="/admin/$collection/new"
              params={{ collection: definition.id }}
            >
              <Plus className="size-[15px]" strokeWidth={2} />
              {definition.action}
            </Link>
          </Button>
        }
      />
      <Rule />

      {total === 0 ? (
        <EmptyState
          title={definition.emptyTitle}
          body={definition.emptyBody}
          action={
            <Button asChild>
              <Link
                to="/admin/$collection/new"
                params={{ collection: definition.id }}
              >
                {definition.action}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <FilterBar
            query={query}
            onQueryChange={setQuery}
            placeholder={definition.searchHint}
            count={`${paged.total} of ${total}`}
          />

          {definition.summary && (
            <TileStrip className="mb-5" tiles={definition.summary} />
          )}

          <DataTable
            columns={toTableColumns(definition.columns)}
            rows={paged.rows}
            rowKey={(row) => row.id}
            onRowClick={open}
            onEdit={(row) =>
              navigate({
                to: '/admin/$collection/$recordId/edit',
                params: { collection: definition.id, recordId: row.id },
              })
            }
            onDelete={askDelete}
            searchQuery={query}
            onClearSearch={() => setQuery('')}
          />

          <Pagination
            page={page}
            paged={paged}
            footer={definition.footer}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </>
  )
}
