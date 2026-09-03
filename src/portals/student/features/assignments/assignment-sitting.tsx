import { useNavigate } from '@tanstack/react-router'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'
import type { AssignmentDetail } from '@/api/assignments/types'
import { useSubmitAssignment } from '@/api/assignments/hooks'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import { clearAttempt, type StoredAttempt, writeAttempt } from './attempt'
import { formatClock, isRunningOut } from './clock'
import { OptionList } from './option-list'
import {
  answeredCount,
  type Draft,
  isAnswered,
  isTheory,
  assignmentMeta,
  questionsOf,
  submitBody,
} from './assignment'
import { QuestionPips } from './question-pips'
import { useCountdown } from './use-countdown'

/**
 * The assignment itself, one question at a time.
 *
 * The attempt is passed in rather than begun here: when the student started and
 * when their time runs out both belong to the sitting, which outlives this
 * component — it is remounted by every reload, and neither the clock nor the
 * answers may start again with it. See `attempt.ts`.
 */
export function AssignmentSitting({
  assignment,
  assignmentId,
  attempt,
  owner,
}: {
  assignment: AssignmentDetail
  assignmentId: string
  attempt: StoredAttempt
  owner: string
}) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const submit = useSubmitAssignment(assignmentId)
  const questions = questionsOf(assignment)
  const total = questions.length

  const [draft, setDraft] = useState<Draft>(() => attempt.draft)
  const [questionParam, setQuestion] = useQueryState('q', parseAsInteger.withDefault(1))

  const index = Math.min(Math.max(1, questionParam), Math.max(1, total)) - 1
  const question = questions[index]
  const answered = answeredCount(draft, questions)

  // Every answer is kept as it is given. A student who loses the page mid-way
  // comes back to what they had written, on the clock they already had.
  useEffect(() => {
    writeAttempt(owner, { ...attempt, draft })
  }, [owner, attempt, draft])

  const send = () =>
    submit
      .mutateAsync(submitBody(draft, questions, new Date(attempt.startedAt)))
      .then(() => {
        // The sitting is over: anything left in the browser would be resumed
        // against an assignment that can no longer be answered.
        clearAttempt(owner, assignmentId)
        return navigate({
          to: '/student/assignments/$assignmentId/result',
          params: { assignmentId },
        })
      })
      // The toast has already said what went wrong; the assignment stays put so the
      // answers are not lost with it.
      .catch(() => undefined)

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-2xs uppercase tracking-kicker text-brand-700">
            Assignment
          </div>
          <h2 className="mt-2 text-page-title">
            {assignment.assignment?.title?.trim() || 'This assignment'}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{assignmentMeta(assignment)}</p>
        </div>
        <AssignmentClock deadline={attempt.expiresAt} onExpired={send} />
      </div>
      <Rule />

      <QuestionPips
        count={total}
        current={index}
        answered={(at) => {
          const one = questions[at]
          // The same test the counter below uses. A theory box holding only
          // spaces is not an answer, and a filled pip over "3 of 4 answered"
          // is the assignment telling the student two different things at once.
          return one ? isAnswered(draft, one) : false
        }}
        onJump={(next) => void setQuestion(next + 1)}
      />

      {question && (
        <div key={question.id} className="animate-ems-up">
          <div className="text-2xs uppercase tracking-label text-muted-foreground">
            Question {index + 1} of {total}
            {question.points ? ` · ${question.points} marks` : ''}
          </div>
          <h3 className="my-2.5 mb-5.5 text-2xl leading-[1.25] text-pretty">
            {question.question_text?.trim() || `Question ${index + 1}`}
          </h3>

          {isTheory(question) ? (
            <Textarea
              rows={8}
              value={String(draft[question.id] ?? '')}
              placeholder="Write your answer here."
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, [question.id]: event.target.value }))
              }
            />
          ) : (
            <OptionList
              options={question.options ?? []}
              chosen={
                typeof draft[question.id] === 'number'
                  ? (draft[question.id] as number)
                  : undefined
              }
              onChoose={(optionId) =>
                setDraft((previous) => ({ ...previous, [question.id]: optionId }))
              }
            />
          )}
        </div>
      )}

      <div className="mt-6.5 flex flex-wrap items-center gap-2.5">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => void setQuestion(index)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={index >= total - 1}
          onClick={() => void setQuestion(index + 2)}
        >
          Next question
        </Button>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">
          {answered} of {total} answered
        </div>
        <Button
          disabled={submit.isPending}
          onClick={() =>
            confirm.ask({
              title: 'Submit and finish?',
              body: 'Once you submit you cannot come back to this assignment or change an answer. Any question you left blank is marked zero.',
              subject: `${answered} of ${total} questions answered`,
              cancel: 'Keep working',
              cta: 'Submit assignment',
              // Handed back rather than fired, so the dialog holds with its
              // button spinning until the school has actually taken it.
              onConfirm: send,
            })
          }
        >
          {submit.isPending ? 'Submitting…' : 'Submit assignment'}
        </Button>
      </div>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}

/**
 * The clock, on an assignment that sets a limit.
 *
 * An assignment without one shows no countdown: a timer running down to a
 * deadline the school never set would be inventing one.
 */
function AssignmentClock({
  deadline,
  onExpired,
}: {
  deadline: number | null
  onExpired: () => void
}) {
  const { seconds } = useCountdown(deadline)
  // Once, on the tick that reaches zero. The assignment goes in as it stands, which
  // is what "time allowed" means — the alternative is a student holding answers
  // the school will not accept. A sitting whose time ran out while the student
  // was away reaches zero on its first read, and goes in there and then.
  const sent = useRef(false)

  useEffect(() => {
    if (deadline === null || seconds > 0 || sent.current) return
    sent.current = true
    onExpired()
  }, [deadline, seconds, onExpired])

  if (deadline === null) return null

  return (
    <div className="text-right">
      <div className="text-2xs uppercase tracking-label text-muted-foreground">
        Time left
      </div>
      <div
        role="timer"
        aria-live="off"
        className={cn(
          'font-heading text-3xl font-extrabold tabular-nums',
          isRunningOut(seconds) && 'text-danger-ink',
        )}
      >
        {formatClock(seconds)}
      </div>
    </div>
  )
}
