import type { FieldSpec } from '../collections/types.ts'

export type ProfileField = FieldSpec & {
  /** Held by the school office — shown as a read-only block, never an input. */
  locked?: boolean
}

export type ProfilePref = {
  label: string
  hint: string
  on: boolean
}

/**
 * One of these per portal. The page is identical in all four — only the person,
 * which fields the office controls, and the wording change.
 */
export type ProfileConfig = {
  initials: string
  /** The line under the name, e.g. "STF-014 · Mathematics · SS1 A, SS2 A". */
  meta: string
  /** Why some of the fields below cannot be edited here. */
  note: string
  fields: ProfileField[]
  /** Current values, keyed as the fields are. */
  values: Record<string, string>
  account: { label: string; value: string }[]
  prefs: ProfilePref[]
  /** What signing the other devices out means for this role. */
  sessionNote: string
}
