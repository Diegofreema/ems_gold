import { createFileRoute } from '@tanstack/react-router'
import {
  setAssignments,
  setScripts,
  setSubmissions,
} from '@/db/collections/set-assignments'
import { pageSearch } from '@/lib/search'
import { SubmissionsPage } from '@/portals/teacher/features/assignments/submissions-page'

export const Route = createFileRoute('/teacher/submissions')({
  // Which assignment is being marked, and whose paper is open. Both are what
  // the page opens on, so a row of the register can lead straight to a script.
  validateSearch: pageSearch(['assignment', 'submission']),
  // Fire and forget. The scripts are one request per submission, which is why
  // they sync when Marking is opened rather than with the shell — a teacher
  // who opens this page while the staffroom still has signal walks to class
  // with every script on the device.
  loader: () => {
    for (const set of [setAssignments, setSubmissions, setScripts]) {
      void set.preload().catch(() => undefined)
    }
  },
  staticData: {
    title: 'Marking',
    crumb: 'Assessment · Set assignments',
    crumbTo: '/teacher/assignments',
  },
  component: SubmissionsPage,
})
