import { adminsService } from '@/api/admins/service'
import { teachersService } from '@/api/teachers/service'
import type {
  CollectionDef,
  FormSectionSpec,
  ListPath,
  Row,
} from '@/features/collections/types'
import type { Paginated } from '@/api/types'
import { emptySource } from '@/features/collections/api'
import { PAGE_SIZE } from '@/hooks/use-list-query'
import { adminBody, adminUpdate, teacherBody, teacherUpdate } from './staff-body'
import { activityRow, adminRow, parseStaffKey, staffTarget, teacherRow } from './staff-row'

/**
 * The API keeps staff in two places, not one: `GET /teachers` is the teaching
 * record and `GET /admins` is the office record, and neither knows about the
 * other. Both are paged, so a single merged page would have to interleave two
 * pagings — this register switches between them on the role filter instead,
 * which keeps every page a real page of a real endpoint.
 */
const ADMINISTRATORS = 'Administrators'

async function listTeachers(page: number, q: string): Promise<Paginated<Row>> {
  const { items, pagination } = await teachersService.list({ page, limit: PAGE_SIZE, q })
  return { items: items.map(teacherRow), pagination }
}

async function listAdmins(page: number): Promise<Paginated<Row>> {
  // `GET /admins` takes no `q`, so the search box cannot narrow this one.
  const { items, pagination } = await adminsService.list({ page, limit: PAGE_SIZE })
  return { items: items.map(adminRow), pagination }
}

/** A summary figure, read off the pagination that comes back with one row. */
const countTeachers = async () =>
  (await teachersService.list({ limit: 1 })).pagination.total

const countAdmins = async () => (await adminsService.list({ limit: 1 })).pagination.total

/** Reads one record from whichever endpoint its id says it came from. */
async function staffRecord(recordId: string): Promise<Row> {
  const { kind, id } = parseStaffKey(recordId)
  return kind === 'admin'
    ? adminRow(await adminsService.get(id))
    : teacherRow(await teachersService.get(id))
}

/**
 * Writes the form back to the endpoint the record belongs to. Creating from
 * the combined register asks which of the two is being added; the pinned pages
 * already know, and pass their own kind.
 */
function saveStaff(kind?: 'teacher' | 'admin') {
  return async (values: Record<string, unknown>, recordId?: string) => {
    const target = staffTarget(kind, values.role, recordId)

    if (recordId) {
      const { id } = parseStaffKey(recordId)
      return target === 'admin'
        ? adminsService.update(id, adminUpdate(values))
        : teachersService.update(id, teacherUpdate(values))
    }

    return target === 'admin'
      ? adminsService.create(adminBody(values))
      : teachersService.create(teacherBody(values))
  }
}

const ACTIVITY_LIMIT = 20

const IDENTITY: FormSectionSpec = {
  title: 'Staff member',
  fields: [
    { key: 'firstname', label: 'First name', required: true, placeholder: 'Chukwuma' },
    { key: 'lastname', label: 'Surname', required: true, placeholder: 'Nnaji' },
    { key: 'middlename', label: 'Middle name', placeholder: 'Obinna' },
    { key: 'gender', label: 'Gender', options: ['Female', 'Male'] },
    { key: 'phone', label: 'Phone', numeric: true, placeholder: '0803 441 2280' },
    { key: 'department_id', label: 'Department', optionsFrom: 'classes' },
  ],
}

const ACCOUNT: FormSectionSpec = {
  title: 'Account',
  fields: [
    {
      key: 'username',
      label: 'Sign-in name',
      wide: true,
      // The login is created with the record and never renamed from here, so
      // an edit leaves this empty and sends nothing.
      hint: 'Only used when the account is first created.',
      placeholder: 'cnnaji',
    },
    { key: 'address', label: 'Home address', multiline: true, wide: true, placeholder: '2 Aba Road, Enugu' },
  ],
}

const TEACHING: FormSectionSpec = {
  title: 'Teaching',
  fields: [
    {
      key: 'qualification',
      label: 'Qualification',
      wide: true,
      placeholder: 'B.Sc Mathematics',
      hint: 'Held on the teaching record only.',
    },
  ],
}

const STAFF_COLUMNS: CollectionDef['columns'] = [
  { key: 'name', label: 'Name', cardRole: 'title' },
  { key: 'role', label: 'Role', cardRole: 'subtitle' },
  { key: 'phone', label: 'Phone' },
  { key: 'gender', label: 'Gender' },
  { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
]

/** What the record panel reads, whichever of the two opened it. */
const STAFF_DETAIL = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'gender', label: 'Gender' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'adviser', label: 'Form arm' },
  { key: 'department', label: 'Department' },
  { key: 'joined', label: 'On record since' },
  { key: 'username', label: 'Signs in with' },
]

/**
 * The audit trail, which only the office record keeps. A teacher's tab comes
 * back empty rather than calling an endpoint that would answer for whichever
 * admin happens to share their id.
 */
const ACTIVITY_TAB: CollectionDef['tabs'] = [
  {
    label: 'Activity',
    columns: [
      { key: 'when', label: 'When' },
      { key: 'type', label: 'Type' },
      { key: 'action', label: 'Action' },
      { key: 'ip', label: 'IP' },
    ],
    empty: 'No activity recorded against this record.',
    source: async (recordId) => {
      const { kind, id } = parseStaffKey(recordId)
      if (kind !== 'admin') return []
      const activity = await adminsService.activityLogs(id, ACTIVITY_LIMIT)
      return activity.logs.map(activityRow)
    },
  },
]

export const staff: CollectionDef = {
  id: 'staff',
  tabs: ACTIVITY_TAB,
  path: '/admin/staff',
  kicker: 'Staff',
  title: 'Manage staff',
  description:
    'Everyone the school employs. Teaching and office records are kept apart, so the role picks which register you are looking at.',
  action: 'Add staff member',
  searchHint: 'Search staff name',
  footer: 'Teaching and office records',
  emptyTitle: 'No staff records',
  emptyBody: 'Add your teaching and office staff to assign subjects and arms.',
  noun: 'staff member',
  nameKey: 'name',
  counts: [
    { label: 'Teachers', count: countTeachers },
    { label: ADMINISTRATORS, count: countAdmins },
  ],
  columns: STAFF_COLUMNS,
  detail: STAFF_DETAIL,
  filters: [
    // Unset, the register is the teaching staff — much the larger of the two.
    // Picking the other one is not a narrowing: it is the other register.
    { key: 'role', label: 'Teachers', options: [ADMINISTRATORS], replaces: true },
  ],
  source: ({ page, q, filters }) =>
    filters.role === ADMINISTRATORS ? listAdmins(page) : listTeachers(page, q),
  record: staffRecord,
  save: saveStaff(),
  form: [
    IDENTITY,
    {
      title: 'Role',
      fields: [
        {
          key: 'role',
          label: 'Kind of record',
          required: true,
          options: ['Teacher', ADMINISTRATORS],
          hint: 'A teaching record carries subjects; an office record carries privileges.',
        },
      ],
    },
    ACCOUNT,
    TEACHING,
  ],
}

/**
 * The two sub-routes are the same records pinned to one endpoint, so they
 * inherit the base definition's columns, panel and delete behaviour.
 */
function staffSlice(
  id: string,
  path: ListPath,
  title: string,
  description: string,
  overrides: Partial<CollectionDef>,
): CollectionDef {
  return {
    ...staff,
    id,
    path,
    title,
    description,
    counts: undefined,
    filters: undefined,
    ...overrides,
  }
}

export const staffAdmin = staffSlice(
  'staff-admin',
  '/admin/staff-admin',
  'Administrators',
  'The people who run the office: the principal, the bursary and the heads of section. These accounts see the admin portal.',
  {
    footer: 'Office records',
    emptyTitle: 'No office records',
    emptyBody: 'Add an administrator to give someone access to this portal.',
    // `GET /admins` takes no search parameter.
    searchable: false,
    source: ({ page }) => listAdmins(page),
    save: saveStaff('admin'),
    form: [IDENTITY, ACCOUNT],
  },
)

export const staffTeachers = staffSlice(
  'staff-teachers',
  '/admin/staff-teachers',
  'Teachers',
  'Everyone who carries a subject. These accounts see the teacher portal and enter scores.',
  {
    footer: 'Teaching records',
    emptyTitle: 'No teaching records',
    emptyBody: 'Add a teacher to assign them subjects and an arm.',
    source: ({ page, q }) => listTeachers(page, q),
    save: saveStaff('teacher'),
    form: [IDENTITY, ACCOUNT, TEACHING],
  },
)

/**
 * Non-teaching staff — library, ICT, health, security. The API has no register
 * for them: a person is either a teaching record or an office one, and the
 * logins behind them cannot be listed by role. The page says so rather than
 * showing people who are not there.
 */
export const staffOther = staffSlice(
  'staff-other',
  '/admin/staff-other',
  'Other staff',
  'Non-teaching staff — library, ICT, health and security.',
  {
    footer: 'No separate register',
    emptyTitle: 'Non-teaching staff are not kept apart',
    emptyBody:
      'This school’s records hold teaching staff and office staff only. A librarian or a security officer is added as an office record, and appears under Administrators.',
    searchable: false,
    source: emptySource,
    counts: undefined,
    // Adding one here writes the office record the empty state points at, so
    // the button does what the page says rather than nothing.
    form: [IDENTITY, ACCOUNT],
    save: saveStaff('admin'),
  },
)
