import { useQuery } from '@tanstack/react-query'
import { admissionsService } from '@/api/admissions/service'
import { namedRows } from './application'

/*
 * Plain `useQuery`, and on purpose — the exception CLAUDE.md asks to be
 * justified. The device's collections are the signed-in school's: they are
 * wiped on sign-out, preloaded by a portal shell, and a signed-out visitor
 * must not start one. These three are the school's public lookups, asked by
 * somebody with no account, on one page.
 *
 * `networkMode: 'always'` for the reason the option feeds carry it: under the
 * default a request with no connection pauses rather than fails, so the class
 * box would say "Loading" for as long as the family was offline instead of
 * saying it cannot be reached, and the states would never fall back.
 */
const LOOKUP = {
  networkMode: 'always',
  staleTime: 60 * 60 * 1000,
  retry: 1,
} as const

export type Choice = { value: string; label: string }

const asChoices = (rows: { id: number; name: string }[]): Choice[] =>
  rows.map((row) => ({ value: String(row.id), label: row.name }))

/**
 * The classes a family can apply into. There is nothing to fall back to: the
 * school's classes are the school's, and an application without one is
 * refused, so a failure here is said and retried rather than papered over.
 */
export function useApplyClasses() {
  return useQuery({
    queryKey: ['apply', 'classes'],
    queryFn: async () => {
      const rows = namedRows(await admissionsService.classes(), 'departments')
      if (rows.length === 0) throw new Error('The school sent no classes.')
      return asChoices(rows)
    },
    ...LOOKUP,
  })
}

/**
 * The states, from the school where it answers and from the device where it
 * does not. The two agree by construction — the device's table is the
 * school's own numbering of Nigeria's states, read off live records (see
 * `country-ids.ts`) — so a family with no signal still gets past this box.
 */
export function useApplyStates() {
  return useQuery({
    queryKey: ['apply', 'states'],
    queryFn: async (): Promise<Choice[]> => {
      try {
        const rows = namedRows(await admissionsService.states(), 'states')
        if (rows.length > 0) return asChoices(rows)
      } catch {
        /* Falls through to the device's own table. */
      }
      const { stateOptions } = await import('@/features/collections/countries')
      const { STATES_KNOWN_FOR } = await import('@/features/collections/country-ids')
      return stateOptions(STATES_KNOWN_FOR)
    },
    ...LOOKUP,
  })
}

/**
 * The local government areas of the chosen state. Optional on an application,
 * so a list that cannot be had is a box the form leaves out, not a stop.
 */
export function useApplyLgas(stateId: string) {
  const id = Number(stateId)
  return useQuery({
    queryKey: ['apply', 'lgas', id],
    queryFn: async () => asChoices(namedRows(await admissionsService.lgas(id), 'lgas')),
    enabled: Number.isInteger(id) && id > 0,
    ...LOOKUP,
  })
}
