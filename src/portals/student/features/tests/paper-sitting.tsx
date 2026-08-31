import { useNavigate } from '@tanstack/react-router'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'
import type { AssignmentPaper } from '@/api/assignments/types'
import { useSubmitAssignment } from '@/api/assignments/hooks'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import { formatClock, isRunningOut } from './clock'
import { OptionList } from './option-list'
import {
  answeredCount,
  type Draft,
  isTheory,
  limitSeconds,
  paperMeta,
  questionsOf,
  submitBody,
} from './paper'
import { QuestionPips } from './question-pips'
import { useCountdown } from './use-countdown'

/**
 * The paper itself, one question at a time.
 *
 * `openedAt` is passed in rather than taken here: the endpoint wants when the
 * pupil actually started, and that is the moment they pressed the button on
 * the brief, not the moment this component happened to mount.
 */
export function PaperSitting({
  paper,
  testId,
  openedAt,
}: {
  paper: AssignmentPaper
  testId: string
  openedAt: Date
}) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const submit = useSubmitAssignment(testId)
  const questions = questionsOf(paper)
  const total = questions.length

  const [draft, setDraft] = useState<Draft>({})
  const [questionParam, setQuestion] = useQueryState('q', parseAsInteger.withDefault(1))

  const index = Math.min(Math.max(1, questionParam), Math.max(1, total)) - 1
  const question = questions[index]
  const answered = answeredCount(draft, questions)

  const send = () =>
    submit
      .mutateAsync(submitBody(draft, questions, openedAt))
      .then(() => navigate({ to: '/student/tests/$testId/result', params: { testId } }))
      // The toast has already said what went wrong; the paper stays put so the
      // answers are not lost with it.
      .catch(() => undefined)

  return (
    <div className="max-w-[820px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
            Computer-based test
          </div>
          <h2 className="mt-2 text-page-title">
            {paper.assignment?.title?.trim() || 'This test'}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{paperMeta(paper)}</p>
        </div>
        <PaperClock paper={paper} onExpired={send} />
      </div>
      <Rule />

      <QuestionPips
        count={total}
        current={index}
        answered={(at) => {
          const one = questions[at]
          return one ? draft[one.id] !== undefined : false
        }}
        onJump={(next) => void setQuestion(next + 1)}
      />

      {question && (
        <div key={question.id} className="animate-ems-up">
          <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Question {index + 1} of {total}
            {question.points ? ` · ${question.points} marks` : ''}
          </div>
          <h3 className="my-2.5 mb-[22px] text-2xl leading-[1.25] text-pretty">
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

      <div className="mt-[26px] flex flex-wrap items-center gap-2.5">
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
              body: 'Once you submit you cannot come back to this paper or change an answer. Any question you left blank is marked zero.',
              subject: `${answered} of ${total} questions answered`,
              cancel: 'Keep working',
              cta: 'Submit test',
              // Handed back rather than fired, so the dialog holds with its
              // button spinning until the school has actually taken it.
              onConfirm: send,
            })
          }
        >
          {submit.isPending ? 'Submitting…' : 'Submit test'}
        </Button>
      </div>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}

/**
 * The clock, on a paper that sets a limit.
 *
 * A paper without one shows its closing time instead of a countdown: a timer
 * running down to a deadline the school never set would be inventing one.
 */
function PaperClock({
  paper,
  onExpired,
}: {
  paper: AssignmentPaper
  onExpired: () => void
}) {
  const allowed = limitSeconds(paper)
  const { seconds } = useCountdown(allowed ?? 0)
  // Once, on the tick that reaches zero. The paper goes in as it stands, which
  // is what "time allowed" means — the alternative is a pupil holding answers
  // the school will not accept.
  const sent = useRef(false)

  useEffect(() => {
    if (allowed === null || seconds > 0 || sent.current) return
    sent.current = true
    onExpired()
  }, [allowed, seconds, onExpired])

  if (allowed === null) return null

  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        Time left
      </div>
      <div
        role="timer"
        aria-live="off"
        className={cn(
          'font-heading text-[30px] font-extrabold tabular-nums',
          isRunningOut(seconds) && 'text-brand',
        )}
      >
        {formatClock(seconds)}
      </div>
    </div>
  )
}
