import { myFamilyService } from '@/api/parents/service'
import type { Child as EnrolledChild, FamilyInvoice } from '@/api/parents/types'
import type { Mark } from '@/portals/parent/family'
import { schoolCollection } from '../collection'
import { SET } from '../ids'
import { readSnapshot } from '../snapshot'

/**
 * The household, on the guardian's own device.
 *
 * Three sets rather than one composed answer, because that is what makes them
 * joinable and what keeps derived text out of the database: a `Child` as the
 * screens read it carries formatted invoice rows and a drawn attendance chart,
 * and none of that should survive a change of copy, let alone be written to
 * disk. So the school's own shapes are stored and the reading is done live.
 *
 * Every one of these is token-scoped at the endpoint — `sparents/my-*` resolves
 * the caller and answers for their household alone — so no other family's rows
 * ever reach this device. That is the rule the skill asks for: filter at the
 * fetch, not at the query.
 */

/** Who the children are, so one with nothing billed still appears. */
export const parentChildren = schoolCollection<EnrolledChild, number>({
  id: SET.parentChildren,
  fetch: () => myFamilyService.children(),
  getKey: (child) => child.id,
  schemaVersion: 1,
})

/**
 * Invoices for the whole household in one page.
 *
 * A family years behind runs to a few dozen, not a few hundred. The limit is
 * the one `familyQuery` already used.
 */
export const INVOICE_SCAN = 200

export const parentInvoices = schoolCollection<FamilyInvoice, number>({
  id: SET.parentInvoices,
  fetch: () =>
    myFamilyService.invoices({ limit: INVOICE_SCAN }).then((page) => page.items),
  getKey: (invoice) => invoice.id,
  schemaVersion: 1,
})

/** A mark, with the child it belongs to and a key of its own. */
export type ChildMark = Mark & {
  /** `<childId>:<date>` — the register holds one mark per child per day. */
  id: string
  childId: number
}

/**
 * A week either side of the window the chart draws, so a mark on its first
 * Monday is not lost to a timezone.
 */
const MARK_DAYS = (6 + 1) * 7

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Every child's register, flattened into one set.
 *
 * There is no household-wide register — `my-children/{id}/attendance` is the
 * only one a guardian may read — so this still costs a request per child. A
 * child whose register refuses is drawn with no marks rather than taking the
 * household down with them, exactly as before.
 *
 * Whose children they are is read off the copy the children collection already
 * keeps, and only asked for when there is none.
 *
 * Deliberately not `queryClient.query`, which would have deduplicated it
 * nicely and then hung: that carries the app's default network mode, so with
 * no connection it pauses the request instead of failing it, the fetch never
 * settles, and the collection sits in `loading` for as long as the device is
 * offline — taking the route loader waiting on it down too. A collection's
 * fetcher must always be able to finish.
 */
export const parentAttendance = schoolCollection<ChildMark, string>({
  id: SET.parentAttendance,
  fetch: async () => {
    const children =
      readSnapshot<EnrolledChild>(SET.parentChildren) ?? (await myFamilyService.children())

    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - MARK_DAYS)

    const perChild = await Promise.all(
      children.map((child) =>
        myFamilyService
          .childAttendance(child.id, {
            start_date: isoDay(from),
            end_date: isoDay(today),
          })
          .then((answer) =>
            (answer.attendance as Mark[]).map(
              (mark): ChildMark => ({
                ...mark,
                childId: child.id,
                id: `${child.id}:${mark.attendance_date}`,
              }),
            ),
          )
          .catch((): ChildMark[] => []),
      ),
    )

    return perChild.flat()
  },
  getKey: (mark) => mark.id,
  schemaVersion: 1,
})

/** Everything the parent portal keeps on the device. */
export const parentCollections = [parentChildren, parentInvoices, parentAttendance]
