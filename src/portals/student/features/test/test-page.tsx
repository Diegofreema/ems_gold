import { useNavigate } from '@tanstack/react-router'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import { formatClock, isRunningOut } from './clock'
import { OptionList } from './option-list'
import { PAPER } from './paper'
import { QuestionPips } from './question-pips'
import { useCountdown } from './use-countdown'

/** Which option the pupil picked, by question index. */
type Answers = Record<number, number>

const LAST = PAPER.questions.length - 1

export function TestPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { seconds, stop } = useCountdown(PAPER.seconds)
  const [answers, setAnswers] = useState<Answers>({})
  const [questionParam, setQuestion] = useQueryState(
    'q',
    parseAsInteger.withDefault(1),
  )

  const index = Math.min(Math.max(1, questionParam), PAPER.questions.length) - 1
  const question = PAPER.questions[index]
  const answered = Object.keys(answers).length

  const goTo = (next: number) => void setQuestion(next + 1)

  const submit = () =>
    confirm.ask({
      title: 'Submit and finish?',
      body: 'Once you submit you cannot come back to this paper or change an answer. Any question you left blank is marked zero.',
      subject: `${answered} of ${PAPER.questions.length} questions answered`,
      cancel: 'Keep working',
      cta: 'Submit test',
      onConfirm: () => {
        stop()
        void navigate({ to: '/student/test/receipt', search: { answered } })
      },
    })

  return (
    <div className="max-w-[820px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
            Computer-based test
          </div>
          <h2 className="mt-2 text-page-title">{PAPER.title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{PAPER.meta}</p>
        </div>
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
      </div>
      <Rule />

      <QuestionPips
        count={PAPER.questions.length}
        current={index}
        answered={(at) => answers[at] !== undefined}
        onJump={goTo}
      />

      <div key={index} className="animate-ems-up">
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Question {index + 1} of {PAPER.questions.length}
        </div>
        <h3 className="my-2.5 mb-[22px] text-2xl leading-[1.25] text-pretty">
          {question.text}
        </h3>
        <OptionList
          options={question.options}
          chosen={answers[index]}
          onChoose={(choice) =>
            setAnswers((previous) => ({ ...previous, [index]: choice }))
          }
        />
      </div>

      <div className="mt-[26px] flex flex-wrap items-center gap-2.5">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={index === LAST}
          onClick={() => goTo(index + 1)}
        >
          Next question
        </Button>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">
          {answered} of {PAPER.questions.length} answered
        </div>
        <Button onClick={submit}>Submit test</Button>
      </div>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}
