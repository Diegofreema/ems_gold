export type Question = {
  text: string
  options: string[]
}

/** Stand-in for `GET /students/me/tests/<id>`. */
export const PAPER = {
  title: 'Quadratic equations quiz',
  meta: 'Mathematics · C. Nnaji · 6 questions shown of 20 · one attempt',
  /** The design opens the paper with 24:55 on the clock. */
  seconds: 1495,
  questions: [
    { text: 'Factorise x² − 5x + 6.', options: ['(x − 2)(x − 3)', '(x + 2)(x + 3)', '(x − 1)(x − 6)', '(x + 1)(x − 6)'] },
    { text: 'What is the sum of the roots of 2x² − 8x + 6 = 0?', options: ['3', '4', '−4', '6'] },
    { text: 'The discriminant of x² + 4x + 4 = 0 is:', options: ['0', '4', '16', '−4'] },
    { text: 'If α and β are roots of x² − 7x + 12, then αβ equals:', options: ['12', '7', '−12', '5'] },
    { text: 'Complete the square: x² + 6x = (x + 3)² − ?', options: ['9', '3', '6', '36'] },
    { text: 'Solve 3x² = 27.', options: ['x = ±3', 'x = 9', 'x = ±9', 'x = 3'] },
  ] satisfies Question[],
}

export const RECEIPT_REFERENCE = 'CBT-2025-004182'
