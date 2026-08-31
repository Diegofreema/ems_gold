import type {
  SetAssignment,
  TeacherDashboard,
  TeacherResult,
} from '../../../../api/teaching/types.ts';
import type { Notification } from '../../../../features/notifications/types.ts';
import {
  schoolMillis,
  schoolTime,
  when,
} from '../../../../features/collections/when.ts';
import { isOpen } from '../dashboard/dashboard.ts';

/**
 * The teacher's notifications, worked out from what the school actually holds.
 *
 * There is no notification endpoint on this API — `/teachers/me/notifications`,
 * `/notifications` and `/users/me/notifications` all answer "Controller class
 * Error could not be found" — so nothing here is a message somebody sent. Each
 * item is a record that already exists, read as the event that produced it:
 * marks the office has approved, sent back or not looked at yet, and the papers
 * this teacher has set. Both lists are ones the portal already asks for, so the
 * bell costs no request the pages were not making anyway.
 *
 * What that rules out is anything nobody wrote down. There is no "the office
 * replied to you" here, because `message-admin` only posts; no "your e-class
 * starts in an hour", because a room carries no schedule; and no read receipt,
 * because read is a browser-side flag and the API never hears about it.
 */

const MILLIS_PER_DAY = 86_400_000;

/** Midnight before a moment, on the reader's own clock. */
function dayStart(millis: number): number {
  const at = new Date(millis);
  at.setHours(0, 0, 0, 0);
  return at.getTime();
}

/** Whole days between a moment and now — 0 today, 1 yesterday. */
function daysAgo(millis: number, now: Date): number {
  return Math.round(
    (dayStart(now.getTime()) - dayStart(millis)) / MILLIS_PER_DAY,
  );
}

/**
 * The stamp as the feed writes it: the clock time for something that happened
 * today, the word for yesterday, and the day itself for anything older — with
 * the year once it is not this one.
 */
export function noticeWhen(millis: number, now: Date): string {
  const days = daysAgo(millis, now);
  const at = new Date(millis);
  if (days <= 0) {
    return at.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  if (days === 1) return 'Yesterday';
  return at.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    ...(at.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

/** The two headings the page groups under. */
export function noticeGroup(millis: number, now: Date): Notification['group'] {
  return daysAgo(millis, now) <= 0 ? 'Today' : 'Earlier';
}

/** What the office has done with a mark, whatever it wrote in the column. */
type MarkState = 'approved' | 'rejected' | 'pending';

function markState(mark: TeacherResult): MarkState {
  const state = mark.approval_status?.trim().toLowerCase();
  if (state === 'approved') return 'approved';
  if (state === 'rejected' || state === 'declined') return 'rejected';
  return 'pending';
}

/**
 * One sheet's worth of marks: a subject taught to a class in a term, all in
 * the same state. Marks arrive one pupil at a time and a teacher files a whole
 * class at once, so thirty rows are one thing that happened, not thirty.
 */
type MarkGroup = {
  state: MarkState;
  subject: string;
  klass: string;
  term: string;
  count: number;
  at: number;
  reason: string | null;
};

function group(mark: TeacherResult): string[] {
  return [
    markState(mark),
    mark.subject?.name?.trim() || `Subject ${mark.subject_id}`,
    mark.department?.name?.trim() || '',
    [mark.semester?.name, mark.session?.name].filter(Boolean).join(' · '),
  ];
}

/**
 * When the office's decision happened. `approved_at` is the only stamp for one;
 * a mark still waiting, or one sent back, has nothing but the day it was filed.
 */
function stampOf(mark: TeacherResult, state: MarkState): number | null {
  return state === 'approved'
    ? (schoolMillis(mark.approved_at) ?? schoolMillis(mark.uploaddate))
    : schoolMillis(mark.uploaddate);
}

export function markGroups(marks: TeacherResult[]): MarkGroup[] {
  const groups = new Map<string, MarkGroup>();

  for (const mark of marks) {
    const state = markState(mark);
    const at = stampOf(mark, state);
    // A mark with no readable stamp has no place on a feed ordered by time.
    if (at === null) continue;

    const parts = group(mark);
    const [, subject, klass, term] = parts;
    const held = groups.get(parts.join('|'));
    const reason = mark.rejection_reason?.trim() || null;

    if (!held) {
      groups.set(parts.join('|'), {
        state,
        subject,
        klass,
        term,
        count: 1,
        at,
        reason,
      });
      continue;
    }
    held.count += 1;
    // The sheet is dated by its newest mark: a class finished over two days
    // reads as having happened on the second.
    held.at = Math.max(held.at, at);
    held.reason ??= reason;
  }

  return [...groups.values()];
}

const SHEET: Record<
  MarkState,
  { title: (subject: string) => string; to: string; tail: string }
> = {
  approved: {
    title: (subject) => `${subject} marks were approved`,
    to: '/teacher/results',
    tail: 'Pupils and parents can see them now.',
  },
  rejected: {
    title: (subject) => `${subject} marks were sent back`,
    to: '/teacher/scores',
    tail: 'Correct them on the score sheet and file them again.',
  },
  pending: {
    title: (subject) => `${subject} marks are with the office`,
    to: '/teacher/results',
    tail: 'Nothing is published until the office approves them.',
  },
};

/** An item with the moment it is filed under, which the sort needs and the row does not. */
type Dated = { at: number; notice: Notification };

function markNotice(entry: MarkGroup, now: Date): Dated {
  const copy = SHEET[entry.state];
  const marks = `${entry.count} mark${entry.count === 1 ? '' : 's'}`;

  return {
    at: entry.at,
    notice: {
      // Stable across a refetch, because read is remembered against it.
      id: `mark-${entry.state}-${entry.subject}-${entry.klass}-${entry.term}`,
      kicker: 'Assessment',
      title: copy.title(entry.subject),
      body: `${[entry.klass, entry.term, marks].filter(Boolean).join(' · ')}. ${
        entry.reason ?? copy.tail
      }`,
      when: noticeWhen(entry.at, now),
      group: noticeGroup(entry.at, now),
      to: copy.to,
    },
  };
}

/**
 * A paper is dated by whichever of its two moments has already passed: one
 * still taking submissions is news for having opened, and one that is over is
 * news for having closed.
 */
function paperStamp(paper: SetAssignment, open: boolean): number | null {
  return open
    ? schoolMillis(paper.opendate)
    : (schoolMillis(paper.closedate) ?? schoolMillis(paper.opendate));
}

function paperNotice(paper: SetAssignment, now: Date): Dated | null {
  const open = isOpen(paper, now);
  const at = paperStamp(paper, open);
  if (at === null) return null;

  const questions = paper.total_questions ?? 0;
  const closes = paper.closedate
    ? `${open ? 'Closes' : 'Closed'} ${when(schoolTime(paper.closedate), true)}.`
    : 'No closing time was set.';

  return {
    at,
    notice: {
      id: `paper-${paper.id}`,
      kicker: 'Teaching',
      title: `${paper.title?.trim() || `Paper ${paper.id}`} ${
        open ? 'is taking submissions' : 'has closed'
      }`,
      body: `${[
        paper.subject?.name,
        `${questions} question${questions === 1 ? '' : 's'}`,
      ]
        .filter(Boolean)
        .join(' · ')}. ${closes}`,
      when: noticeWhen(at, now),
      group: noticeGroup(at, now),
      // Papers are read on the dashboard; the portal has no page of its own
      // for them, so that is where opening one leads.
      to: '/teacher',
    },
  };
}

/** Everything the teacher has to be told about, newest first. */
export function teacherNotices(
  dashboard: TeacherDashboard | undefined,
  marks: TeacherResult[],
  now: Date,
): Notification[] {
  const sheets = markGroups(marks).map((entry) => markNotice(entry, now));
  const papers = (dashboard?.recent_assignments ?? []).flatMap(
    (paper) => paperNotice(paper, now) ?? [],
  );

  return [...sheets, ...papers]
    .sort((one, two) => two.at - one.at)
    .map((entry) => entry.notice);
}
