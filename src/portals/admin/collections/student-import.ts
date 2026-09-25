import type { ActionOutcome } from '../features/actions/types.ts'

/**
 * Enrolling a roster from a spreadsheet, via `POST /students/import`.
 *
 * The headings are the school's own template (`students_format.xlsx`, handed
 * over 2026-09-25), word for word, in its order and its capitals — "Dob",
 * "email", "Regno" — because nobody has seen whether the importer reads by
 * heading or by position, and a sheet that matches both works either way.
 */
export const IMPORT_COLUMNS = [
  'Surname',
  'First Name',
  'Dob',
  'Class',
  'email',
  'Address',
  'phone',
  'admission date',
  'gender',
  'Regno',
] as const

/** Roughly the school's own widths, so the template opens the way theirs did. */
const WIDTHS = [16, 16, 12, 12, 26, 30, 16, 16, 10, 16]

/**
 * The template as a real `.xlsx`: the heading row and nothing else.
 *
 * The school's copy carries an example student on row 2. That is left out on
 * purpose — a sheet sent back with the example still in it enrols somebody who
 * does not exist, and nothing on this side could tell that row from a real
 * one. What the example was for is said beside the button instead.
 *
 * The writer is imported on the press, as the results template's is, so an
 * office that never imports does not carry it.
 */
export async function importTemplateFile(): Promise<Blob> {
  const writeXlsxFile = (await import('write-excel-file/browser')).default
  const headings = IMPORT_COLUMNS.map((label) => ({
    value: label,
    type: String,
    fontWeight: 'bold' as const,
    backgroundColor: '#EEF1F4',
    borderBottomStyle: 'thin' as const,
    borderBottomColor: '#B9C1CA',
  }))
  return writeXlsxFile([headings], {
    sheet: 'Sheet1',
    columns: WIDTHS.map((width) => ({ width })),
    stickyRowsCount: 1,
  }).toBlob()
}

export const IMPORT_TEMPLATE_NAME = 'students-import-template.xlsx'

type Loose = Record<string, unknown>

const isObject = (value: unknown): value is Loose =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Where a count of students taken might be kept. Read, never assumed. */
const COUNT_KEYS = ['imported', 'created', 'inserted', 'saved', 'added', 'count', 'total_imported']
/** Where the rows the school turned down might be listed. */
const FAILURE_KEYS = ['errors', 'failures', 'failed', 'skipped', 'rejected', 'invalid']

function countOf(answer: Loose): number | undefined {
  for (const key of COUNT_KEYS) {
    const value = answer[key]
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value
    if (Array.isArray(value)) return value.length
  }
  if (Array.isArray(answer.students)) return answer.students.length
  return undefined
}

/** One refused row as a sentence: "Row 4: Class not found". */
function failureLine(item: unknown): string | undefined {
  if (typeof item === 'string') return item.trim() || undefined
  if (!isObject(item)) return undefined
  const row = item.row ?? item.line ?? item.row_number ?? item.rownum
  const said = item.message ?? item.reason ?? item.error ?? item.errors
  const reason = Array.isArray(said)
    ? said.filter((one) => typeof one === 'string').join('; ')
    : isObject(said)
      ? Object.values(said).filter((one) => typeof one === 'string').join('; ')
      : typeof said === 'string'
        ? said
        : ''
  const where = typeof row === 'number' || (typeof row === 'string' && row.trim()) ? `Row ${row}` : ''
  if (!reason.trim()) return where ? `${where}: not imported` : undefined
  return where ? `${where}: ${reason.trim()}` : reason.trim()
}

function failuresOf(answer: Loose): string[] {
  for (const key of FAILURE_KEYS) {
    const value = answer[key]
    if (Array.isArray(value)) return value.map(failureLine).filter((line): line is string => Boolean(line))
    // `{ "4": "Class not found" }`, row to reason.
    if (isObject(value)) {
      return Object.entries(value)
        .map(([row, reason]) => failureLine({ row, message: reason }))
        .filter((line): line is string => Boolean(line))
    }
  }
  return []
}

const students = (count: number) => (count === 1 ? '1 student' : `${count} students`)

/**
 * What the import did, as the flow page reports it.
 *
 * The answer's shape has never been seen — the endpoint was handed over as a
 * request with no reply — so this reads the likely places for a count and a
 * list of refused rows, and says only what it found. A count it cannot find is
 * not guessed at: "The file was accepted" is true of any answer that was not a
 * refusal, and a figure invented here would be a register the office trusts.
 */
export function importOutcome(answer: unknown): ActionOutcome {
  const body = isObject(answer) ? (isObject(answer.result) ? answer.result : answer) : {}
  const count = countOf(body)
  const failures = failuresOf(body)
  const taken = count === undefined ? 'The file was accepted' : `${students(count)} imported`
  return {
    message: failures.length > 0 ? `${taken}. Some rows were not — they are listed on the page.` : `${taken}.`,
    ...(failures.length > 0
      ? {
          failures,
          failuresTitle:
            failures.length === 1 ? 'One row was not imported' : `${failures.length} rows were not imported`,
        }
      : {}),
  }
}
