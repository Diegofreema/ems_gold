import type { Align, CardRole } from '@/lib/table.ts'

/**
 * The static list routes. Spelling them out keeps `Link to={definition.path}`
 * type-checked — a typo here is a compile error, not a dead link.
 */
export type AdminListPath =
  | '/admin/fees'
  | '/admin/collect'
  | '/admin/invoices'
  | '/admin/spendings'
  | '/admin/students'
  | '/admin/applicants'
  | '/admin/attendance'
  | '/admin/staff'
  | '/admin/staff-admin'
  | '/admin/staff-teachers'
  | '/admin/staff-other'
  | '/admin/parents'
  | '/admin/parents-owing'
  | '/admin/parents-cleared'
  | '/admin/parents-invited'
  | '/admin/classes'
  | '/admin/subjects'
  | '/admin/calendar'
  | '/admin/results'
  | '/admin/library'
  | '/admin/elections'
  | '/admin/logs'

/** Every fixture cell is display text; the API returns the same shape. */
export type Row = { id: string } & Record<string, string>

export type ColumnSpec = {
  key: string
  label: string
  align?: Align
  /** Renders the value as a status tag, coloured by meaning. */
  tag?: boolean
  cardRole?: CardRole
}

export type FieldSpec = {
  key: string
  label: string
  required?: boolean
  /** Two grid columns; the design uses this for names and free text. */
  wide?: boolean
  placeholder?: string
  hint?: string
  options?: readonly string[]
  multiline?: boolean
  numeric?: boolean
  email?: boolean
  date?: boolean
}

export type FormSectionSpec = {
  title: string
  fields: FieldSpec[]
}

/**
 * One admin collection: its copy, its columns, its rows and the form used to
 * create or edit a record. Adding a list page means adding one of these.
 */
export type CollectionDef = {
  id: string
  path: AdminListPath
  kicker: string
  title: string
  description: string
  /** Primary action label, e.g. "Create fee". */
  action: string
  searchHint: string
  footer: string
  emptyTitle: string
  emptyBody: string
  /** Singular noun used in delete confirms, e.g. "fee". */
  noun: string
  summary?: { label: string; value: string }[]
  columns: ColumnSpec[]
  rows: Row[]
  /** The column holding the record's name — used in titles and confirms. */
  nameKey: string
  form?: FormSectionSpec[]
}
