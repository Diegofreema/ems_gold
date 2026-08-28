/**
 * A CBT paper as a pupil sees it. The answer key is never sent — options
 * carry their text and order only.
 */
export type Assignment = {
  id: number
  title?: string
  subject_id?: number
  question_count?: number
  my_status?: AssignmentStatus
  /** Null while the paper is open; otherwise why it cannot be sat. */
  window_problem?: string | null
  [key: string]: unknown
}

export type AssignmentStatus = 'available' | 'in_progress' | 'completed'

export type Question = {
  id: number
  question_text: string
  question_type: 'multiple_choice' | 'theory'
  order_number: number
  options?: { id: number; option_text: string; order_number: number }[]
}

/**
 * Question id to answer: an option id for multiple choice, free text for
 * theory. An option belonging to another question is discarded rather than
 * scored.
 */
export type SubmitAssignmentBody = {
  answers: Record<string, number | string>
  /** ISO timestamp of when the pupil actually opened the paper. */
  actual_start_time?: string
}

/** Says whether each answer was correct, never which option was right. */
export type AssignmentResult = Record<string, unknown>

/** The marking view: adds `correct_option_id` and `theory_score`. */
export type Submission = Record<string, unknown>
