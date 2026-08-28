export type BatchLine = {
  line: number
  name: string
  /** Blank when the file had no mark on that line. */
  ca: string
  exam: string
  /** Blank when the bursary read the line cleanly. */
  problem: string
}

/** Stand-in for `GET /teachers/me/uploads/<batch>`. */
export const BATCH_LINES: BatchLine[] = [
  { line: 4, name: 'Ngozi Eze', ca: '26', exam: '52', problem: '' },
  { line: 5, name: 'Halima Yusuf', ca: '27', exam: '55', problem: '' },
  { line: 6, name: 'Blessing Okoro', ca: '24', exam: '50', problem: '' },
  { line: 7, name: 'Emeka Obi', ca: '', exam: '43', problem: 'No CA score in the file' },
  { line: 8, name: 'Grace Onu', ca: '18', exam: '39', problem: '' },
  { line: 9, name: 'Yusuf Garba', ca: '34', exam: '46', problem: 'CA above the 30 mark maximum' },
  { line: 10, name: 'Precious Ajayi', ca: '25', exam: '49', problem: '' },
  { line: 11, name: 'Michael Etim', ca: '16', exam: '', problem: 'No exam score in the file' },
  { line: 12, name: 'Chidi Umeh', ca: '21', exam: '44', problem: 'Not registered to this arm' },
]
