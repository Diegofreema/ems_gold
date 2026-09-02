import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { studentPaperQuery } from '../../api/queries'
import { PaperBrief } from './paper-brief'
import { PaperSitting } from './paper-sitting'
import { questionsOf, windowProblem } from './paper'
import { stateOf } from './tests'

/**
 * One paper: its terms first, and its questions only once the pupil says they
 * are ready.
 *
 * The brief is not ceremony. A paper can be sat once, the clock starts when it
 * is started, and `actual_start_time` is sent back as part of the submission —
 * so the moment the questions appear has to be a moment the pupil chose.
 */
export function TestPage({ testId }: { testId: string }) {
  const { data: paper } = useSuspenseQuery(studentPaperQuery(testId))
  const [openedAt, setOpenedAt] = useState<Date | null>(null)

  const submission = paper.my_submission
  const problem = windowProblem(paper)
  const questions = questionsOf(paper)

  // The register's four states, worked out from the detail route's fields:
  // this route nulls `submitted` and `window_problem` inside `assignment` and
  // sends the truth beside it.
  const state = stateOf({
    ...paper.assignment,
    submitted: Boolean(submission),
    window_problem: problem ?? null,
  })

  if (submission) {
    return (
      <PaperBrief
        paper={paper}
        state="Submitted"
        note="You have already sat this paper. It can only be taken once, so what was sent is what will be marked."
        action={
          <Button asChild>
            <Link to="/student/tests/$testId/result" params={{ testId }}>
              See how you did
            </Link>
          </Button>
        }
      />
    )
  }

  if (problem) {
    return <PaperBrief paper={paper} state={state} note={problem} />
  }

  if (!questions.length) {
    return (
      <PaperBrief
        paper={paper}
        state={state}
        note="Your teacher has not written any questions into this paper yet. There is nothing to answer, so nothing to submit — check back before it closes."
      />
    )
  }

  if (!openedAt) {
    return (
      <PaperBrief
        paper={paper}
        state={state}
        note="Read the terms above before you begin. The paper can be taken once: when you submit it, that is the attempt the school marks."
        action={<Button onClick={() => setOpenedAt(new Date())}>Start the test</Button>}
      />
    )
  }

  return <PaperSitting paper={paper} testId={testId} openedAt={openedAt} />
}
