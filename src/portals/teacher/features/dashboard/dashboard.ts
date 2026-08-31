import type {
  SetAssignment,
  TeacherClassArm,
  TeacherDashboard,
  TeacherDashboardStats,
} from '../../../../api/teaching/types.ts';
import { BLANK } from '../../../../features/collections/blank.ts';
import { schoolTime, when } from '../../../../features/collections/when.ts';

/**
 * The teacher's home page, off `GET /teachers/me/dashboard`.
 *
 * The endpoint answers five counters, the papers this teacher has set and the
 * arms they take. It has no timetable and no class averages — the two panels
 * the prototype drew from neither — so the page shows what the school actually
 * holds instead.
 */

/** A stamp read on the school's own clock, or null where it will not parse. */
function at(stamp: string | null): number | null {
  if (!stamp) return null;
  const parsed = new Date(schoolTime(stamp) ?? '').getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/** Whether a paper is still taking submissions. */
export function isOpen(paper: SetAssignment, now: Date): boolean {
  const closes = at(paper.closedate);
  return closes === null || closes > now.getTime();
}

function armNames(arms: TeacherClassArm[]): string {
  return arms.map((arm) => arm.arm_name).join(', ');
}

/** A figure written as a plain count, as the tiles want it. */
function countTile(label: string, amount: number, delta: string, hot = false) {
  return { label, amount, format: 'number' as const, delta, hot };
}

/** The four counters across the top. */
export function teacherFigures(dashboard: TeacherDashboard) {
  const { stats } = dashboard;
  const arms = dashboard.class_arms;

  return [
    countTile(
      'Pupils I teach',
      stats.my_students,
      `Of ${stats.total_students} in the school`,
    ),
    countTile(
      'My subjects',
      stats.my_subjects,
      stats.my_subjects ? 'Set by the school office' : 'None assigned yet',
    ),
    countTile(
      'Classes I take',
      arms.length,
      armNames(arms) || 'Not a class teacher this session',
    ),
    countTile(
      'Papers open',
      stats.pending_assignments,
      stats.pending_assignments
        ? 'Still taking submissions'
        : 'Nothing open just now',
      // Worth flagging only while something is actually open.
      stats.pending_assignments > 0,
    ),
  ];
}

/**
 * The line under the greeting. Attendance is the one thing on this page that
 * is a task rather than a figure, so it leads.
 */
export function teacherNote(stats: TeacherDashboardStats): string {
  const attendance = stats.attendance_taken_today
    ? 'Today’s attendance is in.'
    : 'Today’s attendance has not been taken yet.';
  const papers = stats.pending_assignments
    ? `${stats.pending_assignments} of your papers ${stats.pending_assignments === 1 ? 'is' : 'are'} still open.`
    : 'No paper of yours is open.';

  return `${attendance} ${papers}`;
}

/**
 * The papers this teacher has set, newest first.
 *
 * The API's own `status` is left out: it reads 'active' on a paper that shut
 * days ago, because nothing re-checks the clock when the row is written. The
 * closing time is what the list says instead, and an open one is flagged.
 */
export function assignmentEntries(papers: SetAssignment[], now: Date) {
  return papers.map((paper) => {
    const open = isOpen(paper, now);
    const questions = paper.total_questions ?? 0;

    return {
      id: String(paper.id),
      text: paper.title?.trim() || `Paper ${paper.id}`,
      who: [
        paper.subject?.name,
        `${questions} question${questions === 1 ? '' : 's'}`,
      ]
        .filter(Boolean)
        .join(' · '),
      when: paper.closedate
        ? `${open ? 'Closes' : 'Closed'} ${when(schoolTime(paper.closedate), true)}`
        : 'No closing time',
      flagged: open,
    };
  });
}

/** The arms taken, each against the class it belongs to. */
export function armRows(
  arms: TeacherClassArm[],
): { label: string; value: string }[] {
  return arms.map((arm) => ({
    label: arm.arm_name,
    value: arm.department?.name?.trim() || BLANK,
  }));
}
