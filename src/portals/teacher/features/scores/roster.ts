export const SCORE_SUBJECTS = ['Mathematics', 'Further Maths'] as const
export const SCORE_ARMS = ['SS1 A', 'SS2 A'] as const

export type Pupil = { name: string; ca: string; exam: string }

/** Stand-in for `GET /teachers/me/registered-students`, keyed subject + arm. */
const ROSTER: Record<string, Pupil[]> = {
  'Mathematics|SS1 A': [
    { name: 'Ngozi Eze', ca: '26', exam: '52' },
    { name: 'Halima Yusuf', ca: '27', exam: '55' },
    { name: 'Blessing Okoro', ca: '24', exam: '50' },
    { name: 'Emeka Obi', ca: '21', exam: '43' },
    { name: 'Grace Onu', ca: '18', exam: '39' },
    { name: 'Yusuf Garba', ca: '22', exam: '46' },
    { name: 'Precious Ajayi', ca: '25', exam: '49' },
    { name: 'Michael Etim', ca: '16', exam: '33' },
  ],
  'Mathematics|SS2 A': [
    { name: 'Segun Bakare', ca: '19', exam: '38' },
    { name: 'Chinedu Udo', ca: '23', exam: '47' },
    { name: 'Zainab Lawal', ca: '25', exam: '51' },
    { name: 'Samuel Idris', ca: '15', exam: '30' },
    { name: 'Amarachi Nwosu', ca: '21', exam: '44' },
    { name: 'Tolu Adeyemi', ca: '20', exam: '41' },
  ],
  'Further Maths|SS2 A': [
    { name: 'Chinedu Udo', ca: '20', exam: '44' },
    { name: 'Zainab Lawal', ca: '24', exam: '48' },
    { name: 'Segun Bakare', ca: '17', exam: '35' },
    { name: 'Ngozi Eze', ca: '26', exam: '53' },
  ],
  'Further Maths|SS1 A': [
    { name: 'Halima Yusuf', ca: '22', exam: '45' },
    { name: 'Emeka Obi', ca: '19', exam: '37' },
  ],
}

export function rosterFor(subject: string, arm: string): Pupil[] {
  return ROSTER[`${subject}|${arm}`] ?? []
}
