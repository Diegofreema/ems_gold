import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CollectionDef } from './types'

const sentence = (noun: string) => noun.charAt(0).toUpperCase() + noun.slice(1)

/**
 * Writes a record back through the collection's own `save`, then drops the
 * cached list and record so the register shows what was actually stored
 * rather than what was typed.
 */
export function useSaveRecord(definition: CollectionDef, editing: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      values,
      recordId,
    }: {
      values: Record<string, unknown>
      recordId?: string
    }) => definition.save!(values, recordId),
    // "Pupil created", to read like every other toast in the app.
    meta: {
      success: `${sentence(definition.noun)} ${editing ? 'updated' : 'created'}`,
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['collection', definition.path] }),
  })
}
