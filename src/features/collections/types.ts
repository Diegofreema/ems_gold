import type { Paginated } from '../../api/types.ts'
import type { OptionsKey } from './options.ts'
import type { Align, CardRole } from '@/lib/table.ts'

/**
 * Every static list route across the portals. Spelling them out keeps
 * `Link to={definition.path}` type-checked — a typo here is a compile error,
 * not a dead link.
 */
export type ListPath =
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
  | '/teacher/subjects'
  | '/teacher/students'
  | '/teacher/topics'
  | '/teacher/eclasses'
  | '/teacher/uploads'
  | '/teacher/results'
  | '/student/courses'
  | '/student/materials'
  | '/student/timetable'
  | '/student/tests'
  | '/student/results'
  | '/student/invoices'
  | '/student/record'
  | '/parent/children'
  | '/parent/results'
  | '/parent/attendance'
  | '/parent/invoices'
  | '/parent/receipts'
  | '/parent/tests'

/**
 * Where a portal keeps its generic record routes. Every portal mounts the same
 * three shapes, so one object per portal is all the components need to know.
 */
export type RecordPath =
  | '/admin/$collection/$recordId'
  | '/teacher/$collection/$recordId'
  | '/student/$collection/$recordId'
  | '/parent/$collection/$recordId'

/**
 * A portal whose records can be changed publishes all three routes. A
 * read-only portal publishes only `record`, so the components cannot link to
 * an edit or create page that does not exist for it.
 */
export type CollectionRoutes =
  | {
      record: RecordPath
      edit:
        | '/admin/$collection/$recordId/edit'
        | '/teacher/$collection/$recordId/edit'
      create: '/admin/$collection/new' | '/teacher/$collection/new'
      /** Where this portal mounts its guided flows, if it has any. */
      flow?: '/admin/$collection/action'
    }
  | { record: RecordPath; edit?: never; create?: never; flow?: never }

/** Where a list's primary action goes when it is not a create form. */
export type ActionPath =
  | '/student/test'
  | '/parent/pay'
  | '/parent/children/add'

/**
 * A guided flow a collection's records can be put through — allocating a fee
 * to class arms, reviewing an application. Only the button label lives here;
 * the flow itself is defined by the portal that mounts it.
 */
export type FlowSpec = {
  /** Button label, e.g. "Allocate to classes". */
  label: string
  /** The flow needs no record, so the list's primary action opens it. */
  fromList?: boolean
}

/** Every fixture cell is display text; the API returns the same shape. */
export type Row = { id: string } & Record<string, string>

/** What a list asks for: one page, narrowed by the search box and the filters. */
export type ListParams = {
  page: number
  q: string
  /** Keyed by the query parameter the endpoint takes; empty means unset. */
  filters: Record<string, string>
}

/**
 * A dropdown beside the search box. `key` is the query parameter the endpoint
 * takes, and `label` doubles as the choice that clears it — "All classes".
 */
export type FilterSpec = {
  key: string
  label: string
  options?: readonly string[]
  /** Reads the choices from the API, the same feeds the forms use. */
  optionsFrom?: OptionsKey
  /** Names the filter this one is scoped by; arms belong to a class. */
  dependsOn?: string
}

/**
 * Where a collection's rows come from. A definition that names one is read
 * from the API, paginated and searched by the server; one that does not falls
 * back to the rows written into the definition.
 */
export type ListSource = (params: ListParams) => Promise<Paginated<Row>>

/** A summary tile whose figure the API is asked for rather than written down. */
export type CountTile = { label: string; count: () => Promise<number> }

export type ColumnSpec = {
  key: string
  label: string
  align?: Align
  /** Renders the value as a status tag, coloured by meaning. */
  tag?: boolean
  /** The value is a stored filename; the cell fetches and saves it. */
  download?: boolean
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
  /**
   * Reads the choices from the API instead of listing them, so the form
   * submits the school's own ids. `dependsOn` names the field that scopes the
   * feed — an arm is only meaningful inside a class.
   */
  optionsFrom?: OptionsKey
  dependsOn?: string
  multiline?: boolean
  numeric?: boolean
  email?: boolean
  date?: boolean
}

export type FormSectionSpec = {
  title: string
  fields: FieldSpec[]
}

/** A sub-table shown beside a record's fields on its detail page. */
export type DetailTab = {
  label: string
  columns: ColumnSpec[]
  /** Shown when the tab has no `source`; the fixture rows. */
  rows?: Row[]
  /** Reads the tab from the API for the record being looked at. */
  source?: (recordId: string) => Promise<Row[]>
}

/**
 * One collection: its copy, its columns, its rows and the form used to create
 * or edit a record. Adding a list page means adding one of these.
 */
export type CollectionDef = {
  id: string
  path: ListPath
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
  /**
   * Summary tiles the API counts, replacing `summary` where a collection has
   * one. Each tile names itself up front and asks for its number separately,
   * so the strip is the right shape before any of them answer.
   */
  counts?: readonly CountTile[]
  columns: ColumnSpec[]
  /** The rows to show when the collection has no `source` of its own. */
  rows?: Row[]
  /** Dropdowns beside the search box. Only read by a collection with a `source`. */
  filters?: readonly FilterSpec[]
  /**
   * Reads this collection from the API instead of from `rows`, one page at a
   * time. `record` fetches a single row for the detail page, which cannot go
   * looking in a page it never loaded.
   */
  source?: ListSource
  record?: (recordId: string) => Promise<Row | undefined>
  /**
   * Writes the form back. `recordId` is absent when creating. A collection
   * without one keeps the prototype's toast, since it has no endpoint yet.
   */
  save?: (values: Record<string, unknown>, recordId?: string) => Promise<unknown>
  /**
   * What the record panel lists. Defaults to the table's columns, which is
   * all a fixture row holds; a collection read from the API usually knows far
   * more about a record than the register has room to show.
   */
  detail?: { key: string; label: string }[]
  /** The column holding the record's name — used in titles and confirms. */
  nameKey: string
  form?: FormSectionSpec[]
  /** Sub-tables on the detail page. Defaults to the record's activity. */
  tabs?: DetailTab[]
  /**
   * Distinguishes two definitions that share a path but hold different rows —
   * the parent portal scopes most of its lists to the selected child.
   */
  scope?: string
  /**
   * Sends the primary action somewhere other than a create form. Only read
   * from in portals that publish no create route.
   */
  actionTo?: ActionPath
}
