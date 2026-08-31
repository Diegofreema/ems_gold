import type { Student } from '../../../../api/my-schooling/types.ts'
import type { Row } from '../../../../features/collections/types.ts'
import { asDate, fullName, text } from '../../../../features/profile/record.ts'
import { armOf } from '../../pupil.ts'

/**
 * Everything the school holds about the pupil, field by field, off
 * `GET /students/me`.
 *
 * The point of the page is to be checked: a pupil reads it to find what the
 * office has wrong. So a field the school never filled in is listed with a
 * dash rather than dropped — an empty row is the answer to "what does the
 * school have for my mother's phone", and a missing one is not.
 *
 * Only two of these can be corrected from the portal. The rest are the
 * office's, and each row says so, because "ask the office" is the whole of
 * what a pupil can do about the other eighteen.
 */

const OFFICE = 'The school office keeps this. Ask them to correct it.'
const YOURS = 'Yours to correct — change it on your profile page.'

function field(id: string, label: string, value: string, who = OFFICE): Row {
  return { id, field: label, value, who }
}

/**
 * A birthday is left as the API writes it — DD/MM/YYYY, which is already
 * readable, and which `Date` would read back as the American order and quietly
 * move. The registers in the other portals show it the same way.
 */
export function recordRows(student?: Student): Row[] {
  if (!student) return []

  return [
    field('name', 'Full name', fullName(student.fname, student.mname, student.lname)),
    field('adm', 'Admission number', text(student.regno)),
    field('application', 'Application number', text(student.application_no)),
    field('class', 'Class', text(armOf(student))),
    field('group', 'Class group', text(student.department?.name)),
    field('level', 'Level', text(student.level?.name)),
    field('status', 'Admission status', text(student.status)),
    field('joined', 'On record since', asDate(student.joindate)),
    field('dob', 'Date of birth', text(student.dob)),
    field('gender', 'Gender', text(student.gender)),
    field('religion', 'Religion', text(student.religion)),
    field('phone', 'Phone', text(student.phone), YOURS),
    field('email', 'Email', text(student.email)),
    field('address', 'Home address', text(student.address), YOURS),
    field('community', 'Community', text(student.community)),
    field('lga', 'Local government', text(student.lga?.name)),
    field('state', 'State of origin', text(student.state?.name)),
    field('country', 'Country', text(student.country?.name)),
    field('school', 'Previous school', text(student.previousschool)),
    field('father', "Father's name", text(student.fathersname)),
    field('fatherphone', "Father's phone", text(student.fatherphone)),
    field('mother', "Mother's name", text(student.mothersname)),
    field('motherphone', "Mother's phone", text(student.motherphone)),
    field(
      'guardian',
      'Parent account',
      student.sparent_id ? 'Linked to your record' : 'None linked',
    ),
    field('login', 'Signs in with', text(student.user?.username)),
    field('signin', 'Sign-in', text(student.user?.userstatus)),
  ]
}
