import { studentsService } from '@/api/students/service'
import type { StudentBody } from '@/api/students/types'
import type { Id } from '@/api/types'
import { SET, WRITE } from '../ids'
import { registerHandler } from '../registry'

/**
 * The pupil register.
 *
 * Enrolling one is **not** idempotent — the school issues the admission number
 * and the id, so a replay admits the same child twice. Correcting a record and
 * suspending or reinstating one are: both name a pupil who already exists.
 *
 * There is no delete. The API has no route for one, which the register already
 * knows: a pupil who should not be on it is declined or suspended, and the
 * record stays because everything filed against it does.
 */

registerHandler<StudentBody>(WRITE.enrolStudent, {
  send: (body) => studentsService.create(body),
  idempotent: false,
  collectionId: SET.refStudents,
})

registerHandler<{ id: Id; body: StudentBody }>(WRITE.updateStudent, {
  send: ({ id, body }) => studentsService.update(id, body),
  idempotent: true,
  collectionId: SET.refStudents,
})

/**
 * Suspending a pupil or putting them back. Idempotent: the op says which
 * standing they should end in rather than "toggle".
 */
registerHandler<{ id: Id; status: 'Active' | 'Suspended' }>(WRITE.setStudentStanding, {
  send: ({ id, status }) => studentsService.setStatus(id, { status }),
  idempotent: true,
  collectionId: SET.refStudents,
})
