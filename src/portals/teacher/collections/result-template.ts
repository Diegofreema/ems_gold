/**
 * The spreadsheet a results upload is read from.
 *
 * The office's parser reads by column position, not by heading: A is the
 * registration number, B the CA, and C, D and E the three exam sittings it
 * sums into one exam mark. So the headings here are for the person filling it
 * in, and the **order is the contract** — a sheet with the right words in the
 * wrong columns is a sheet of marks filed against the wrong thing.
 *
 * Written out for the teacher rather than described to them, because the file
 * they upload is the one thing on this page nobody can validate before the
 * office reads it: a wrong shape comes back as a rejected batch days later.
 * The template is filled with their own arm's registration numbers, so the
 * only thing left to do is type the marks.
 */

/** Column A through E, in the order the parser reads them. */
export const RESULT_COLUMNS = [
  'Registration Number',
  'CA',
  '1st Exam',
  '2nd Exam',
  '3rd Exam',
] as const

/**
 * The template as a CSV.
 *
 * CSV rather than xlsx because the endpoint takes all three (`.csv,.xls,.xlsx`)
 * and this one can be written honestly with no dependency — an xlsx is a zip
 * of XML, and shipping a spreadsheet library to emit five columns is a poor
 * trade. Excel and LibreOffice both open it, and a teacher who saves it back
 * as .xlsx is still inside what the endpoint accepts.
 *
 * A row per student, marks left empty. An empty roll still gets the heading
 * row: the shape is the point, and a teacher can type the numbers in by hand.
 */
export function resultTemplate(regnos: readonly string[]): string {
  const rows = [
    RESULT_COLUMNS.join(','),
    // Four trailing commas, so every row already has its five cells and a
    // spreadsheet opens with the columns where the parser expects them.
    ...regnos.map((regno) => `${cell(regno)},,,,`),
  ]
  // A trailing newline: some parsers drop the last line without one.
  return `${rows.join('\r\n')}\r\n`
}

/**
 * One cell. Registration numbers on this deployment are `NETPRO/2026/1` and
 * need no quoting, but a school that puts a comma in one would otherwise
 * shift every column after it.
 */
function cell(value: string): string {
  const text = value.trim()
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** What the file is called when it lands in the teacher's downloads. */
export function templateName(subject?: string, arm?: string): string {
  const parts = ['results', subject, arm]
    .map((part) => part?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .filter(Boolean)
  return `${parts.join('-').replace(/-+/g, '-')}.csv`
}
