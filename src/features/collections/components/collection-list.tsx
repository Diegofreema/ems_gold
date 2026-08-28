import { Link, useNavigate } from '@tanstack/react-router'
import { Download, Plus } from 'lucide-react'
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
import type { CollectionDef, CollectionRoutes, FlowSpec, Row } from '../types'
import { fileActionToast, primaryActionKind } from '../primary-action'
import { useCollectionRows } from '../use-collection-rows'
import { toTableColumns } from './collection-columns'

export function CollectionList({
  definition,
  routes,
  flow,
}: {
  definition: CollectionDef
  routes: CollectionRoutes
  /** The guided flow these records enter, when the portal has one for them. */
  flow?: FlowSpec
}) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { query, page, setQuery, setPage, total, paged } =
    useCollectionRows(definition)

  const params = (row: Row) => ({
    collection: definition.id,
    recordId: row.id,
  })

  const askDelete = (row: Row) =>
    confirm.ask({
      title: `Delete this ${definition.noun}?`,
      body: `This removes the record from the register. Anything already raised against it stays in the audit log.`,
      subject: row[definition.nameKey],
      cta: `Delete the ${definition.noun}`,
      onConfirm: () => toast(`${row[definition.nameKey]} deleted`),
    })

  // One decision, shared with the create route so a list that does not create
  // records has no create page to reach by URL either.
  const primary = primaryActionKind(definition, routes, flow)
  const primaryAction =
    primary === 'file' ? (
      <Button onClick={() => toast(fileActionToast(definition.action))}>
        <Download className="size-[15px]" strokeWidth={2} />
        {definition.action}
      </Button>
    ) : primary === 'flow' && routes.flow ? (
      <Button asChild>
        <Link to={routes.flow} params={{ collection: definition.id }}>
          {definition.action}
        </Link>
      </Button>
    ) : primary === 'create' && routes.create ? (
      <Button asChild>
        <Link to={routes.create} params={{ collection: definition.id }}>
          <Plus className="size-[15px]" strokeWidth={2} />
          {definition.action}
        </Link>
      </Button>
    ) : primary === 'link' && definition.actionTo ? (
      <Button asChild>
        <Link to={definition.actionTo}>{definition.action}</Link>
      </Button>
    ) : (
      <Button onClick={() => toast(`${definition.action} — requested`)}>
        {definition.action}
      </Button>
    )

  const editRoute = routes.edit

  return (
    <>
      <PageHeader
        kicker={definition.kicker}
        title={definition.title}
        description={definition.description}
        action={primaryAction}
      />
      <Rule />

      {total === 0 ? (
        <EmptyState
          title={definition.emptyTitle}
          body={definition.emptyBody}
          action={primaryAction}
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
            onRowClick={(row) =>
              navigate({ to: routes.record, params: params(row) })
            }
            onEdit={
              editRoute
                ? (row) => navigate({ to: editRoute, params: params(row) })
                : undefined
            }
            onDelete={editRoute ? askDelete : undefined}
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
