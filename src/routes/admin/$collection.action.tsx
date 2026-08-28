import { createFileRoute, notFound } from '@tanstack/react-router'
import { adminCollections } from '@/portals/admin/collections'
import { adminFlows } from '@/portals/admin/features/actions/defs'
import { ActionPage } from '@/portals/admin/features/actions/action-page'

export const Route = createFileRoute('/admin/$collection/action')({
  // The record is optional: taking a payment starts without one, allocating a
  // fee starts from the fee. Keeping it in the URL makes the flow shareable.
  validateSearch: (search: Record<string, unknown>): { record?: string } =>
    typeof search.record === 'string' ? { record: search.record } : {},
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: async ({ params, deps }) => {
    const definition = adminCollections[params.collection as keyof typeof adminCollections]
    const flow = definition && adminFlows[params.collection]
    if (!definition || !flow) throw notFound()

    // A live collection is asked for the record; a fixture one holds its own.
    const row = !deps.record
      ? undefined
      : definition.record
        ? await definition.record(deps.record)
        : definition.rows?.find((one) => one.id === deps.record)
    if (deps.record && !row) throw notFound()

    const action = await flow.build(row)
    return {
      definition,
      action,
      heading: { title: action.title, crumb: action.kicker },
    }
  },
  component: FlowRoute,
})

/*
 * `useLoaderData()` is briefly undefined when this route is already mounted and
 * the next navigation's loader throws `notFound()` — React renders the
 * component once more before the not-found boundary takes over. Bailing out of
 * that render keeps the 404 clean instead of crashing into the error boundary.
 */
function FlowRoute() {
  const loaded = Route.useLoaderData()
  if (!loaded) return null
  const { definition, action } = loaded
  return <ActionPage definition={definition} action={action} />
}
