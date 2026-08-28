import type { Row } from '@/features/collections/types'

export type Child = {
  /** Short name used in copy, e.g. "Chinedu is marked absent". */
  name: string
  full: string
  arm: string
  adm: string
  owing: number
  average: number
  position: string
  attendance: number
  /** Days present out of five, last six weeks. */
  weeks: number[]
  results: Row[]
  attendanceRows: Row[]
  invoices: Row[]
  tests: Row[]
}

/** Stand-in for `GET /parents/me/children`. */
export const CHILDREN: Child[] = [
  {
    name: 'Chinedu',
    full: 'Chinedu Udo',
    arm: 'SS2 B',
    adm: 'NEB/2021/0412',
    owing: 85_000,
    average: 66.4,
    position: '11 of 34',
    attendance: 91,
    weeks: [5, 4, 5, 5, 3, 4],
    results: [
      { id: 'cr-1', subject: 'Mathematics', ca: '23', exam: '47', total: '70', grade: 'B', position: '9' },
      { id: 'cr-2', subject: 'Further Maths', ca: '20', exam: '44', total: '64', grade: 'B', position: '5' },
      { id: 'cr-3', subject: 'English Language', ca: '21', exam: '43', total: '64', grade: 'B', position: '14' },
      { id: 'cr-4', subject: 'Biology', ca: '18', exam: '38', total: '56', grade: 'C', position: '19' },
      { id: 'cr-5', subject: 'Chemistry', ca: '17', exam: '35', total: '52', grade: 'C', position: '21' },
      { id: 'cr-6', subject: 'Government', ca: '24', exam: '50', total: '74', grade: 'B', position: '4' },
    ],
    attendanceRows: [
      { id: 'ca-1', date: '19 Nov', day: 'Tuesday', state: 'Present', note: '—' },
      { id: 'ca-2', date: '18 Nov', day: 'Monday', state: 'Present', note: '—' },
      { id: 'ca-3', date: '15 Nov', day: 'Friday', state: 'Absent', note: 'Unexcused' },
      { id: 'ca-4', date: '14 Nov', day: 'Thursday', state: 'Present', note: '—' },
      { id: 'ca-5', date: '13 Nov', day: 'Wednesday', state: 'Late', note: 'Arrived 08:25' },
      { id: 'ca-6', date: '12 Nov', day: 'Tuesday', state: 'Present', note: '—' },
    ],
    invoices: [
      { id: 'INV-25091', invoice: 'INV-25091', fee: 'Boarding', amount: '₦85,000', paid: '₦0', balance: '₦85,000', state: 'Overdue' },
      { id: 'INV-25084', invoice: 'INV-25084', fee: 'Tuition — SS', amount: '₦120,000', paid: '₦120,000', balance: '₦0', state: 'Paid' },
      { id: 'INV-24980', invoice: 'INV-24980', fee: 'ICT levy', amount: '₦15,000', paid: '₦15,000', balance: '₦0', state: 'Paid' },
    ],
    tests: [
      { id: 'ct-1', title: 'Binomial expansion drill', subject: 'Further Maths', closes: 'Fri 22 Nov', score: '—', state: 'Open' },
      { id: 'ct-2', title: 'Cell biology test 2', subject: 'Biology', closes: 'Mon 18 Nov', score: '12 / 15', state: 'Submitted' },
      { id: 'ct-3', title: 'Mole concept quiz', subject: 'Chemistry', closes: 'Wed 06 Nov', score: '—', state: 'Missed' },
    ],
  },
  {
    name: 'Amaka',
    full: 'Amaka Udo',
    arm: 'Primary 5 A',
    adm: 'NEB/2023/1288',
    owing: 32_000,
    average: 81.2,
    position: '2 of 39',
    attendance: 98,
    weeks: [5, 5, 5, 5, 5, 4],
    results: [
      { id: 'ar-1', subject: 'Mathematics', ca: '28', exam: '58', total: '86', grade: 'A', position: '1' },
      { id: 'ar-2', subject: 'English Language', ca: '26', exam: '55', total: '81', grade: 'A', position: '3' },
      { id: 'ar-3', subject: 'Basic Science', ca: '25', exam: '54', total: '79', grade: 'A', position: '2' },
      { id: 'ar-4', subject: 'Verbal Reasoning', ca: '27', exam: '52', total: '79', grade: 'A', position: '4' },
      { id: 'ar-5', subject: 'Social Studies', ca: '24', exam: '51', total: '75', grade: 'A', position: '6' },
      { id: 'ar-6', subject: 'Civic Education', ca: '26', exam: '53', total: '79', grade: 'A', position: '2' },
    ],
    attendanceRows: [
      { id: 'aa-1', date: '19 Nov', day: 'Tuesday', state: 'Present', note: '—' },
      { id: 'aa-2', date: '18 Nov', day: 'Monday', state: 'Present', note: '—' },
      { id: 'aa-3', date: '15 Nov', day: 'Friday', state: 'Present', note: '—' },
      { id: 'aa-4', date: '14 Nov', day: 'Thursday', state: 'Present', note: '—' },
      { id: 'aa-5', date: '13 Nov', day: 'Wednesday', state: 'Absent', note: 'Excused — clinic' },
      { id: 'aa-6', date: '12 Nov', day: 'Tuesday', state: 'Present', note: '—' },
    ],
    invoices: [
      { id: 'INV-25117', invoice: 'INV-25117', fee: 'Tuition — Primary', amount: '₦62,000', paid: '₦30,000', balance: '₦32,000', state: 'Part paid' },
      { id: 'INV-25012', invoice: 'INV-25012', fee: 'ICT levy', amount: '₦15,000', paid: '₦15,000', balance: '₦0', state: 'Paid' },
    ],
    tests: [
      { id: 'at-1', title: 'Fractions check', subject: 'Mathematics', closes: 'Thu 21 Nov', score: '—', state: 'Open' },
      { id: 'at-2', title: 'Plants and animals', subject: 'Basic Science', closes: 'Fri 15 Nov', score: '14 / 15', state: 'Submitted' },
    ],
  },
]

/** What the family owes across every child. */
export const FAMILY_OWING = CHILDREN.reduce(
  (total, child) => total + child.owing,
  0,
)
