import { queryOptions } from '@tanstack/react-query'
import type { Account } from '@/api/auth/types'
import { attendanceService } from '@/api/attendance/service'
import { collectFeesService } from '@/api/collect-fees/service'
import { myFamilyService, parentsService } from '@/api/parents/service'
import type { Child as EnrolledChild, FamilyInvoice, Parent } from '@/api/parents/types'
import { asFamilyInvoice, familyChild, WEEKS_DRAWN, type Child } from '../family'

/**
 * The guardian record behind the signed-in account, when there is one.
 *
 * Its id is what every family read below is scoped by. It comes off the
 * account rather than out of the URL, so one parent cannot ask for another
 * one's children by editing an address.
 */
export function parentIdOf(account: Account | null | undefined): number | null {
  const type = account?.profile_type
  if (type !== 'parent' && type !== 'sparent') return null
  return (account?.profile as Parent | undefined)?.id ?? null
}

/**
 * A week either side of the window the chart draws, so a mark on its first
 * Monday is not lost to a timezone.
 */
const MARK_DAYS = (WEEKS_DRAWN + 1) * 7

/** Marks come one row per pupil per day; a term of them fits well inside this. */
const MARK_SCAN = 500

/**
 * Invoices for the whole household in one page. A family years behind runs to
 * a few dozen, not a few hundred, and the endpoint pages if it ever does.
 */
const INVOICE_SCAN = 200

/**
 * The same invoices, asked for a pupil at a time.
 *
 * Only reached when the household's own list refuses — see `familyQuery`. It
 * costs one request per child instead of one for the family, which is why it
 * is the second choice rather than the first.
 */
async function ledgersFor(children: EnrolledChild[]): Promise<FamilyInvoice[]> {
  const ledgers = await Promise.all(
    children.map((child) => collectFeesService.studentLedger(child.id, true)),
  )
  return ledgers.flatMap((ledger, index) =>
    ledger.invoices.map((invoice) => asFamilyInvoice(invoice, children[index].id)),
  )
}

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * The household, as the parent portal reads it.
 *
 * Three endpoints:
 *
 * - `sparents/my-invoices` — every invoice raised against every child, in one
 *   call. It resolves the household from the caller and takes no id
 * - `sparents/{id}/children` — who the children are, so a child with nothing
 *   billed against them still appears in the switcher
 * - `admin-attendances/report` — the marks, which it will not filter by pupil,
 *   so the range is asked for whole and split up here
 *
 * The first of those is asked for first and is not relied on. This deployment
 * does not identify the caller — every `sparents/my-*` route answers 403, "No
 * parent record is linked to this account", whatever token is presented — and
 * a portal that went blank on it was a portal nobody could open. So when it
 * refuses, the same invoices are gathered from the counter's per-pupil ledgers
 * instead, and the household reads the same either way.
 *
 * The fallback is meant to be deleted: once the API answers for the caller it
 * will never run, and the other two reads move to their own `my-*`
 * counterparts at the same time. Nothing below `familyChild` knows which
 * endpoint the rows came from.
 */
export function familyQuery(parentId: number | null) {
  return queryOptions({
    queryKey: ['parent', 'family', parentId],
    queryFn: async (): Promise<Child[]> => {
      if (parentId === null) return []

      const today = new Date()
      const from = new Date(today)
      from.setDate(from.getDate() - MARK_DAYS)

      const [enrolled, household, marks] = await Promise.all([
        parentsService.children(parentId),
        myFamilyService
          .invoices({ limit: INVOICE_SCAN })
          .then((page) => page.items)
          // Null rather than a throw: the caller cannot be identified yet, and
          // the ledgers below answer the same question.
          .catch(() => null),
        attendanceService.report({
          start_date: isoDay(from),
          end_date: isoDay(today),
          limit: MARK_SCAN,
        }),
      ])

      const billed = household ?? (await ledgersFor(enrolled))

      return enrolled.map((child) =>
        familyChild(
          child,
          billed.filter((invoice) => invoice.student_id === child.id),
          marks.records.filter((mark) => mark.student?.id === child.id),
          today,
        ),
      )
    },
  })
}
