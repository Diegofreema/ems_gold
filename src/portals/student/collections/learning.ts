import { pageRows } from '@/features/collections/api';
import type { CollectionDef } from '@/features/collections/types';
import { queryClient } from '@/lib/query-client';
import { studentCoursesQuery, studentMaterialsQuery } from '../api/queries';
import { courseRows } from '../features/courses/courses';
import { materialRows } from '../features/materials/materials';

/**
 * The subjects the pupil is registered for, through the cache so the list and
 * the record it opens read one answer between them.
 */
const registered = () =>
  queryClient
    .ensureQueryData(studentCoursesQuery)
    .then((all) => courseRows(all));

export const courses: CollectionDef = {
  id: 'courses',
  path: '/student/courses',
  kicker: 'Learning',
  title: 'My subjects',
  description:
    'The subjects you are registered for this term, and who teaches each. Open one for the class and term it was registered against.',
  // No button. The design's was "Download timetable", and there is no
  // timetable on this API — not a shut endpoint, no endpoint at all.
  action: 'Download timetable',
  readonly: true,
  searchHint: 'Search subject, code or teacher',
  footer: 'Every subject on your registration, in alphabetical order',
  emptyTitle: 'No subjects yet',
  emptyBody:
    'Your subjects appear here once the office registers you for them, and a registration is made for one class and one term at a time. Your marks are on My results whether or not a subject is listed here.',
  noun: 'course',
  nameKey: 'name',
  // No history and no tiles: this is a list of what a pupil takes, and the
  // API keeps no record of when they were put on it.
  tabs: [],
  columns: [
    { key: 'code', label: 'Code', cardRole: 'title' },
    { key: 'name', label: 'Subject', cardRole: 'subtitle' },
    { key: 'teacher', label: 'Teacher' },
  ],
  detail: [
    { key: 'name', label: 'Subject' },
    { key: 'code', label: 'Code' },
    { key: 'teacher', label: 'Teacher' },
    { key: 'klass', label: 'Registered in' },
    { key: 'session', label: 'Session' },
    { key: 'term', label: 'Term' },
  ],
  source: (params) => registered().then((all) => pageRows(all, params)),
  record: (recordId) =>
    registered().then((all) => all.find((row) => row.id === recordId)),
};

/**
 * The notes and papers shared with the pupil's class, through the cache so the
 * list and the record it opens read one answer between them.
 */
const shared = () =>
  queryClient
    .ensureQueryData(studentMaterialsQuery)
    .then((all) => materialRows(all));

export const materials: CollectionDef = {
  id: 'materials',
  path: '/student/materials',
  kicker: 'Learning',
  title: 'Course materials',
  description:
    'Notes, slides and past papers your teachers have shared with your class, newest first.',
  // No button. The design's was "Download all", and there is nothing to
  // download: this endpoint sends no file and no address to fetch one from.
  action: 'Download all',
  readonly: true,
  searchHint: 'Search material or subject',
  footer: 'Everything shared with your class this session',
  emptyTitle: 'Nothing shared yet',
  emptyBody:
    'Notes, slides and past papers appear here as your teachers share them. None have been shared with any class yet.',
  noun: 'material',
  nameKey: 'title',
  // No history and no tiles: a pupil may read what was shared with them, and
  // the API keeps no record of who opened what.
  tabs: [],
  columns: [
    { key: 'title', label: 'Material', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'added', label: 'Added' },
  ],
  detail: [
    { key: 'title', label: 'Material' },
    { key: 'subject', label: 'Subject' },
    { key: 'klass', label: 'Shared with' },
    { key: 'sharedOn', label: 'Shared on' },
  ],
  source: (params) => shared().then((all) => pageRows(all, params)),
  record: (recordId) =>
    shared().then((all) => all.find((row) => row.id === recordId)),
};

/**
 * The one pupil page with nothing behind it.
 *
 * There is no timetable on this API — not a shut endpoint, no endpoint. No
 * route in the whole collection mentions a timetable, a period, a schedule or
 * a slot, and `students/me/timetable` answers "Controller class Error could
 * not be found." rather than a 403, which is what a route that exists but is
 * refused would say.
 *
 * So the page keeps its place in the design and says so. Its fixture — eight
 * periods with rooms in it, "Block B, Rm 4" — was the one invention on this
 * portal that could send a pupil to the wrong room, and no room number exists
 * anywhere on this API to have checked it against.
 */
export const timetable: CollectionDef = {
  id: 'timetable',
  path: '/student/timetable',
  kicker: 'Learning',
  title: 'My timetable',
  description: 'The week as the school runs it.',
  // No button. The design's was "Download PDF", and there is no timetable to
  // put in one.
  action: 'Download PDF',
  readonly: true,
  searchHint: 'Search subject or day',
  footer: '',
  emptyTitle: 'No timetable to show',
  emptyBody:
    "The school does not publish the week's periods in the portal yet. Ask your class teacher for them — the subjects you take, and who teaches each, are on My subjects.",
  noun: 'period',
  nameKey: 'subject',
  tabs: [],
  // No rows and no source: there is nothing to read, so the page is the empty
  // state and nothing else. Columns stay for the day the endpoint exists.
  columns: [
    { key: 'day', label: 'Day', cardRole: 'title' },
    { key: 'time', label: 'Time', cardRole: 'subtitle' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
  ],
};
