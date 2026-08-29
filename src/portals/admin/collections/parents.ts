import { parentsService } from '@/api/parents/service'
import type { ParentStatus } from '@/api/parents/types'
import type { CollectionDef, FormSectionSpec, ListPath } from '@/features/collections/types'
import { emptySource } from '@/features/collections/api'
import { PAGE_SIZE } from '@/hooks/use-list-query'
import { parentBody } from './parent-body'
import { childRow, parentRow } from './parent-row'

/**
 * The two words the API accepts, shown as the register writes them. The value
 * goes back down in lower case, which is the only spelling the endpoint takes.
 */
const STATUSES = ['Active', 'Deactivated'] as const

function asStatus(value: string | undefined): ParentStatus | undefined {
  const word = value?.toLowerCase()
  return word === 'active' || word === 'deactivated' ? word : undefined
}

/** A summary figure, read off the pagination that comes back with one row. */
const countParents = (status?: ParentStatus) => async () =>
  (await parentsService.list({ status, limit: 1 })).pagination.total

const FATHER: FormSectionSpec = {
  title: 'Father',
  fields: [
    { key: 'fathersname', label: 'Name', placeholder: 'Emmanuel Udo' },
    { key: 'fatherphone', label: 'Phone', numeric: true, placeholder: '0803 441 2280' },
    { key: 'fathersjob', label: 'Occupation', placeholder: 'Engineer' },
  ],
}

const MOTHER: FormSectionSpec = {
  title: 'Mother',
  fields: [
    { key: 'mothersname', label: 'Name', placeholder: 'Chidinma Udo' },
    { key: 'motherphone', label: 'Phone', numeric: true, placeholder: '0812 660 7714' },
    { key: 'mothersjob', label: 'Occupation', placeholder: 'Trader' },
  ],
}

const HOUSEHOLD: FormSectionSpec = {
  title: 'Household',
  fields: [
    {
      key: 'pemailaddress',
      label: 'Email',
      email: true,
      wide: true,
      placeholder: 'e.udo@example.com',
      hint: 'The address the guardian signs in with and receives invoices at.',
    },
    { key: 'address', label: 'Home address', multiline: true, wide: true, placeholder: '14 Ogui Road, Enugu' },
  ],
}

/**
 * Children come back for one household at a time, which is why the register
 * shows no count: a column would cost a request a row.
 */
const CHILDREN_TAB: CollectionDef['tabs'] = [
  {
    label: 'Children',
    columns: [
      { key: 'name', label: 'Child' },
      { key: 'adm', label: 'Adm. no.' },
      { key: 'class', label: 'Class' },
      { key: 'arm', label: 'Arm' },
      { key: 'status', label: 'Status', tag: true },
    ],
    source: (recordId) => parentsService.children(recordId).then((kids) => kids.map(childRow)),
    empty: 'No pupil on the register is linked to this guardian yet.',
  },
]

export const parents: CollectionDef = {
  id: 'parents',
  tabs: CHILDREN_TAB,
  path: '/admin/parents',
  kicker: 'Parents',
  title: 'All parents',
  description:
    'Parent and guardian accounts and the children linked to them. A household is one record, whether the school holds one parent or both.',
  action: 'Add parent',
  searchHint: 'Search parent name, email or phone',
  footer: 'Guardian accounts',
  emptyTitle: 'No parent accounts',
  emptyBody:
    'Parent accounts are created when you enrol a pupil, or you can add one directly.',
  noun: 'parent',
  nameKey: 'name',
  counts: [
    { label: 'Active', count: countParents('active') },
    { label: 'Deactivated', count: countParents('deactivated') },
  ],
  columns: [
    { key: 'name', label: 'Parent', cardRole: 'title' },
    { key: 'phone', label: 'Phone', cardRole: 'subtitle' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'name', label: 'Household' },
    { key: 'status', label: 'Status' },
    { key: 'father', label: 'Father' },
    { key: 'mother', label: 'Mother' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'username', label: 'Signs in with' },
  ],
  filters: [{ key: 'status', label: 'Any status', options: STATUSES }],
  source: async ({ page, q, filters }) => {
    const { items, pagination } = await parentsService.list({
      page,
      limit: PAGE_SIZE,
      q,
      status: asStatus(filters.status),
    })
    return { items: items.map(parentRow), pagination }
  },
  record: (recordId) => parentsService.get(recordId).then(parentRow),
  save: (values, recordId) =>
    recordId
      ? parentsService.update(recordId, parentBody(values))
      : parentsService.create(parentBody(values)),
  form: [FATHER, MOTHER, HOUSEHOLD],
}

/** A view over the same guardians, pinned to one status — see `staffSlice`. */
function parentSlice(
  id: string,
  path: ListPath,
  title: string,
  description: string,
  overrides: Partial<CollectionDef>,
): CollectionDef {
  return {
    ...parents,
    id,
    path,
    title,
    description,
    counts: undefined,
    filters: undefined,
    ...overrides,
  }
}

/**
 * Guardians blocked from signing in. This is the one distinction the API draws
 * between accounts, and the only one of these three views it can answer for.
 */
export const parentsDeactivated = parentSlice(
  'parents-invited',
  '/admin/parents-invited',
  'Deactivated',
  'Guardians blocked from signing in. The household and its children stay on the register; only the login is closed.',
  {
    footer: 'Blocked accounts',
    emptyTitle: 'No accounts are blocked',
    emptyBody: 'Every guardian on the register can sign in.',
    source: async ({ page, q }) => {
      const { items, pagination } = await parentsService.list({
        page,
        limit: PAGE_SIZE,
        q,
        status: 'deactivated',
      })
      return { items: items.map(parentRow), pagination }
    },
  },
)

/**
 * What a household owes is the sum of its children's invoices, and nothing
 * answers for that in one call — `GET /collect-fees` lists outstanding
 * invoices per pupil, not per guardian. Splitting the register on a figure
 * that would cost a request per child per row is not a list; these two say so
 * instead of showing a number nobody computed.
 */
function balanceSlice(id: string, path: ListPath, title: string, description: string, body: string) {
  return parentSlice(id, path, title, description, {
    // What this page wanted to show lives on fee collection, invoice by
    // invoice, so the button goes there rather than offering a new guardian.
    action: 'Open fee collection',
    actionTo: '/admin/collect',
    footer: 'Needs a balance endpoint',
    emptyTitle: 'Balances are not held against a guardian',
    emptyBody: body,
    searchable: false,
    counts: undefined,
    form: undefined,
    save: undefined,
    source: emptySource,
  })
}

export const parentsOwing = balanceSlice(
  'parents-owing',
  '/admin/parents-owing',
  'Parents owing',
  'Guardians with a balance on at least one child.',
  'Fees are owed by a pupil, not by a household, so this list cannot be built from what the API answers for today. Fee collection shows every outstanding invoice with the pupil it belongs to.',
)

export const parentsCleared = balanceSlice(
  'parents-cleared',
  '/admin/parents-cleared',
  'Parents cleared',
  'Nothing outstanding across any of their children this term.',
  'Clearing a household means every invoice for every child is settled, and no endpoint answers that in one call. Fee collection shows what is still outstanding, pupil by pupil.',
)
