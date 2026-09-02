import type {
  AssignmentPaper,
  Question,
  SubmitAssignmentBody,
} from '../../../../api/assignments/types.ts'
import { BLANK } from '../../../../features/collections/blank.ts'
import { schoolTime, when } from '../../../../features/collections/when.ts'
import { text } from '../../../../features/profile/record.ts'

/**
 * A paper being sat: what the pupil has answered so far, and what is sent back
 * when they finish.
 *
 * Answers are held by question id rather than by position, because that is
 * what the endpoint takes and because a paper renumbered between two renders
 * would otherwise move every answer one question along.
 */

/** Question id to answer: an option id, or the text of a theory answer. */
export type Draft = Record<number, number | string>

export function questionsOf(paper: AssignmentPaper | undefined): Question[] {
  return paper?.questions ?? []
}

export function isTheory(question: Question): boolean {
  return question.question_type === 'theory' || !(question.options?.length)
}

/**
 * Whether this question has been answered. Whitespace typed into a theory box
 * is not an answer — it would be sent, stored and marked as one.
 */
export function isAnswered(draft: Draft, question: Question): boolean {
  const answer = draft[question.id]
  if (typeof answer === 'string') return answer.trim().length > 0
  return answer !== undefined
}

export function answeredCount(draft: Draft, questions: Question[]): number {
  return questions.filter((question) => isAnswered(draft, question)).length
}

/**
 * When the paper was opened, in the school's own clock and with no zone on it.
 *
 * The API ignores the offset it is sent and keeps the wall clock: a submit
 * carrying `10:00:00Z` is stored as `10:00:00+01:00`. Sending a zone would
 * therefore be sending something that is quietly discarded, and sending the
 * reader's UTC would put the attempt an hour out for anyone abroad. The wall
 * clock, unqualified, is the one thing the school and the pupil agree on.
 */
export function startedAt(at: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `T${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`
  )
}

/**
 * What is posted to `/assignments/{id}/submit`.
 *
 * Unanswered questions are left out rather than sent empty: the API marks a
 * missing answer zero either way, and an empty string filed against a theory
 * question is an answer a teacher then has to read and score.
 */
export function submitBody(
  draft: Draft,
  questions: Question[],
  openedAt: Date,
): SubmitAssignmentBody {
  const answers: Record<string, number | string> = {}
  for (const question of questions) {
    if (!isAnswered(draft, question)) continue
    const answer = draft[question.id]
    answers[String(question.id)] = typeof answer === 'string' ? answer.trim() : answer
  }
  return { answers, actual_start_time: startedAt(openedAt) }
}

/** How long the pupil has, in seconds, where the paper sets a limit at all. */
export function limitSeconds(paper: AssignmentPaper | undefined): number | null {
  const minutes = paper?.assignment?.time_limit
  return minutes ? minutes * 60 : null
}

/**
 * Why the paper cannot be sat, if it cannot.
 *
 * The detail route sends `window_problem` as a sibling of `assignment` and
 * nulls the copy inside it, so the sibling is the one to believe.
 */
export function windowProblem(paper: AssignmentPaper | undefined): string | undefined {
  return paper?.window_problem?.trim() || undefined
}

/** The line under a paper's title: subject, class, and how much of it there is. */
export function paperMeta(paper: AssignmentPaper | undefined): string {
  const assignment = paper?.assignment
  const questions = questionsOf(paper).length
  return [
    assignment?.subject?.trim(),
    assignment?.class?.trim(),
    `${questions} question${questions === 1 ? '' : 's'}`,
    assignment?.time_limit ? `${assignment.time_limit} minutes` : 'no time limit',
    'one attempt',
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * The paper's terms, as the pupil is shown them before starting.
 *
 * `question_count` is null on this route whatever the register said, so the
 * count is the questions actually sent.
 */
export function paperFields(
  paper: AssignmentPaper | undefined,
): { label: string; value: string }[] {
  const assignment = paper?.assignment
  return [
    { label: 'Subject', value: text(assignment?.subject) },
    { label: 'Set for', value: text(assignment?.class) },
    { label: 'Questions', value: String(questionsOf(paper).length) },
    {
      label: 'Time allowed',
      value: assignment?.time_limit ? `${assignment.time_limit} minutes` : 'No limit',
    },
    { label: 'Opens', value: when(schoolTime(assignment?.opendate), true) },
    { label: 'Closes', value: when(schoolTime(assignment?.closedate), true) },
    {
      label: 'Pass mark',
      value: assignment?.passing_score == null ? BLANK : `${assignment.passing_score}%`,
    },
  ]
}
