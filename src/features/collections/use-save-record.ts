import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { capitalise } from '@/lib/format'
import type { CollectionDef } from './types'

/**
 * Writes a record back through the collection's own `save`.
 *
 * The register, the record dialog and the pickers are dropped for every
 * mutation in the app at once — see `dropDerivedReads` — so what is left here
 * is the one thing a query cache cannot reach.
 */
export function useSaveRecord(definition: CollectionDef, editing: boolean) {
  const router = useRouter()

  return useMutation({
    mutationFn: ({
      values,
      recordId,
    }: {
      values: Record<string, unknown>
      recordId?: string
    }) => definition.save!(values, recordId),
    // "Student created", to read like every other toast in the app.
    meta: {
      success: `${capitalise(definition.noun)} ${editing ? 'updated' : 'created'}`,
    },
    // A record that is still a page reads from the route's loader, which no
    // query invalidation reaches — the form goes back to it the moment this
    // resolves, and would land on the values it was opened with.
    onSuccess: () => router.invalidate(),
  })
}
