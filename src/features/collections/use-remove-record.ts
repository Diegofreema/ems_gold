import { useMutation } from '@tanstack/react-query'
import { capitalise } from '@/lib/format'
import type { CollectionDef } from './types'

/**
 * Deletes a record through the collection's own `remove`.
 *
 * The register, the record dialog and the pickers are dropped for every
 * mutation at once — see `dropDerivedReads` — so the deleted row stops being
 * shown and stops being offered without anything being asked for here.
 *
 * The router is deliberately left alone, unlike a save: the caller navigates to
 * the register once this resolves, and re-running the loader of the record that
 * has just been deleted only raises a 404 on the way out.
 *
 * Only ever reached behind a confirm — the button that opens one is drawn by
 * the list and by the record's own form, and both hand the deletion here so
 * there is one place that knows what a delete costs.
 */
export function useRemoveRecord(definition: CollectionDef) {
  return useMutation({
    mutationFn: (recordId: string) => definition.remove!(recordId),
    meta: { success: `${capitalise(definition.noun)} deleted` },
  })
}
