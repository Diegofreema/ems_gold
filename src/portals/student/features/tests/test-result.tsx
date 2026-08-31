import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { Tag } from '@/components/common/tag'
import { EmptyState } from '@/components/feedback/empty-state'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { toneForStatus } from '@/lib/status-tone'
import { studentPaperQuery, studentTestResultQuery } from '../../api/queries'
import { PaperBrief } from './paper-brief'
import { questionsOf } from './paper'
import { answerRows, resultFields, scoreHeadline, scoreNote } from './result'

/**
 * How a submitted paper came out.
 *
 * Reached in two hops on purpose: the result endpoint is keyed on the
 * submission and the URL is keyed on the paper, because the paper is what a
 * pupil has a name for. The paper is read first for the submission's id — and
 * for the wording of the options, which the result itself sends only as ids.
 */
export function TestResult({ testId }: { testId: string }) {
  const { data: paper } = useSuspenseQuery(studentPaperQuery(testId))
  const submission = paper.my_submission

  if (!submission) {
    return (
      <PaperBrief
        paper={paper}
        state="Not sat"
        note="You have not submitted this paper, so there is nothing to mark. Open the test to sit it while it is still open."
        action={
          <Button asChild>
            <Link to="/student/tests/$testId" params={{ testId }}>
              Open the test
            </Link>
          </Button>
        }
      />
    )
  }

  return <Marked testId={testId} submissionId={String(submission.id)} paperQuestions={questionsOf(paper)} />
}

function Marked({
  testId,
  submissionId,
  paperQuestions,
}: {
  testId: string
  submissionId: string
  paperQuestions: ReturnType<typeof questionsOf>
}) {
  const { data: result } = useSuspenseQuery(studentTestResultQuery(submissionId))
  const answers = answerRows(result, paperQuestions)

  return (
    <div className="max-w-[720px]">
      <div className="grid size-10 place-items-center bg-brand text-white">
        <Check className="size-[22px]" strokeWidth={2.4} />
      </div>
      <h2 className="mt-5 text-detail-title">Your paper reached the school</h2>
      <p className="mt-2.5 text-sm text-muted-foreground">
        This is the school's own record of what you sent and how it was marked.
      </p>
      <Rule />

      <div className="border-2 border-foreground">
        <div className="flex flex-wrap items-baseline gap-3 border-b-2 border-divider px-5 py-[18px]">
          <div className="flex-1 font-heading text-[30px] font-extrabold tracking-[-0.01em] tabular-nums">
            {scoreHeadline(result)}
          </div>
          <Tag variant={toneForStatus(result?.assignment?.is_graded ? 'Marked' : 'Not marked')}>
            {result?.assignment?.is_graded ? 'Marked' : 'Not marked'}
          </Tag>
        </div>
        {resultFields(result).map((field, index) => (
          <div
            key={field.label}
            style={{ animationDelay: `${index * 30}ms` }}
            className="flex animate-ems-row gap-4 border-b border-divider px-5 py-3 last:border-b-0"
          >
            <div className="w-[44%] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {field.label}
            </div>
            <div className="flex-1 text-sm tabular-nums">{field.value}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {scoreNote(result)}
      </p>

      <h4 className="mb-0.5 mt-8 text-xl">Your answers</h4>
      <p className="text-[12.5px] text-muted-foreground">
        What you put down, question by question. The school never sends the
        right answer, so a wrong one is a question to take to your teacher.
      </p>

      {answers.length ? (
        <div className="mt-3.5 border-t-2 border-divider">
          {answers.map((answer) => (
            <div key={answer.id} className="border-b border-divider py-3.5">
              <div className="flex flex-wrap items-baseline gap-3">
                <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Question {answer.number}
                  {answer.worth === '—' ? '' : ` · ${answer.worth} marks`}
                </div>
                <div className="flex-1" />
                <Tag variant={toneForStatus(answer.verdict)}>{answer.verdict}</Tag>
              </div>
              <p className="mt-1.5 text-[15px] leading-snug text-pretty">{answer.question}</p>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                You answered: {answer.answer}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3.5">
          <EmptyState
            title="No answers were recorded"
            body="The school holds no answers against this submission. If you did answer, take this up with your teacher — the paper was received, but nothing came with it."
          />
        </div>
      )}
      <Rule />

      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <Link to="/student/tests">Back to my tests</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/student/tests/$testId" params={{ testId }}>
            The paper itself
          </Link>
        </Button>
      </div>
    </div>
  )
}
