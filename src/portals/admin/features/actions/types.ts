import type { FieldSpec } from '@/features/collections/types.ts'

export type PickerItem = {
  key: string
  label: string
  meta: string
  /** Pupils in the arm — the allocate flow bills every one of them. */
  count: number
}

export type PickerSpec = {
  title: string
  items: PickerItem[]
  note: string
  /** Ticked as the flow opens; review arrives with the documents on file. */
  preselected?: string[]
  /** Set when nothing can be raised for an empty selection. */
  requiredMessage?: string
}

/** A field with the value the flow opens on. */
export type ActionField = FieldSpec & { value?: string | Date }

/**
 * One guided flow: what it is for, what it needs picked, what it asks, and
 * what it says when it is done.
 */
export type ActionDef = {
  kicker: string
  title: string
  description: string
  summary: { label: string; value: string }[]
  picker?: PickerSpec
  fields: ActionField[]
  cta: string
  footnote: string
  /** Set by allocate: the per-pupil amount behind the running total. */
  unitAmount?: number
  /** The toast, given how many items were picked. */
  done: (picked: number) => string
  /**
   * Asked before the flow runs. Set where pressing the button commits money
   * against real families and cannot be taken back from this screen.
   */
  confirm?: (total: { pupils: number; amount: number }) => ActionConfirm
}

/**
 * What the confirm dialog is told, minus how to run it. Spelled out rather
 * than imported so this module stays free of JSX and its logic stays testable
 * under the plain node runner; the call site checks it against `ConfirmRequest`.
 */
export type ActionConfirm = {
  title: string
  body: string
  subject: string
  cta: string
  cancel: string
}
