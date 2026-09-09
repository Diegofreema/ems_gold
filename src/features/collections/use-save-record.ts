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
  const queue = definition.queue

  return useMutation({
    mutationFn: async ({
      values,
      recordId,
    }: {
      values: Record<string, unknown>
      recordId?: string
    }) => (queue ? queue(values, recordId) : definition.save!(values, recordId)),
    // "Student created", to read like every other toast in the app. A queued
    // write says the same sentence, but the queue is what says it — and adds
    // "saved on this device" when it had to wait. Two announcements for one
    // save would be one too many.
    meta: queue
      ? undefined
      : {
          success: `${capitalise(definition.noun)} ${editing ? 'updated' : 'created'}`,
        },
    // A record that is still a page reads from the route's loader, which no
    // query invalidation reaches — the form goes back to it the moment this
    // resolves, and would land on the values it was opened with.
    onSuccess: () => router.invalidate(),
  })
}
