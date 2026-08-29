import { classArmsService } from '@/api/class-arms/service'
import { departmentsService } from '@/api/departments/service'
import { subjectsService } from '@/api/subjects/service'
import { optionLabels } from '@/features/collections/option-feeds'
import type { CollectionDef } from '@/features/collections/types'
import { PAGE_SIZE } from '@/hooks/use-list-query'
import { armBody, subjectBody } from './academics-body'
import {
  armPupilRow,
  armRow,
  subjectRow,
  subjectTeacherRow,
} from './academics-row'

/** The three words `class_arms.status` accepts, as the register shows them. */
const ARM_STATUSES = ['Active', 'Inactive', 'Archived'] as const

/** `subjects.status` is a number: 1 is offered, 0 is withdrawn. */
const SUBJECT_STATUSES = ['Active', 'Inactive'] as const

function asId(value: string | undefined) {
  return Number(value) || undefined
}

const countArms = (status?: 'active' | 'inactive' | 'archived') => async () =>
  (await classArmsService.list({ status, limit: 1 })).pagination.total

const countSubjects = (status?: 0 | 1) => async () =>
  (await subjectsService.list({ status, limit: 1 })).pagination.total

const countClasses = async () =>
  (await departmentsService.list({ limit: 1 })).pagination.total

export const classes: CollectionDef = {
  id: 'classes',
  path: '/admin/classes',
  kicker: 'Academics',
  title: 'Classes & arms',
  description:
    'Classes and the arms inside them. An arm is one teachable group with a form teacher and a roll.',
  action: 'Create class arm',
  searchHint: 'Search class or arm',
  footer: 'Class arms',
  emptyTitle: 'No class arms',
  emptyBody: 'Create an arm to start assigning pupils and a form teacher.',
  noun: 'class arm',
  nameKey: 'arm',
  counts: [
    { label: 'Classes', count: countClasses },
    { label: 'Arms', count: countArms() },
    { label: 'Archived', count: countArms('archived') },
  ],
  columns: [
    { key: 'arm', label: 'Arm', cardRole: 'title' },
    { key: 'klass', label: 'Class', cardRole: 'subtitle' },
    { key: 'teacher', label: 'Form teacher' },
    { key: 'roll', label: 'Roll', align: 'right' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'arm', label: 'Arm' },
    { key: 'klass', label: 'Class' },
    { key: 'teacher', label: 'Form teacher' },
    { key: 'roll', label: 'Pupils' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
  ],
  filters: [
    { key: 'department_id', label: 'All classes', optionsFrom: 'classes' },
    { key: 'status', label: 'Any status', options: ARM_STATUSES },
  ],
  source: async ({ page, q, filters }) => {
    // The three at once: neither name feed can hold up the arms themselves.
    const [{ items, pagination }, classNames, teacherNames] = await Promise.all([
      classArmsService.list({
        page,
        limit: PAGE_SIZE,
        q,
        department_id: asId(filters.department_id),
        status: filters.status
          ? (filters.status.toLowerCase() as 'active' | 'inactive' | 'archived')
          : undefined,
      }),
      optionLabels('classes'),
      optionLabels('teachers'),
    ])
    return {
      items: items.map((arm) => armRow(arm, classNames, teacherNames)),
      pagination,
    }
  },
  record: async (recordId) => {
    const [arm, classNames, teacherNames] = await Promise.all([
      classArmsService.get(recordId),
      optionLabels('classes'),
      optionLabels('teachers'),
    ])
    return armRow(arm, classNames, teacherNames)
  },
  save: (values, recordId) =>
    recordId
      ? classArmsService.update(recordId, armBody(values))
      : classArmsService.create(armBody(values)),
  tabs: [
    {
      label: 'Pupils',
      columns: [
        { key: 'name', label: 'Pupil' },
        { key: 'adm', label: 'Adm. no.' },
        { key: 'placed', label: 'Placement', tag: true },
        { key: 'status', label: 'Status', tag: true },
      ],
      // Pupils admitted into the class but not yet placed are listed too —
      // they are exactly who this arm can still take — and marked as such, so
      // the tab is not read as a roll of pupils who are already here.
      source: async (recordId) => {
        const { students, unassigned_in_class } = await classArmsService.students(recordId)
        return [
          ...students.map((pupil) => armPupilRow(pupil, true)),
          ...unassigned_in_class.map((pupil) => armPupilRow(pupil, false)),
        ]
      },
      empty: 'No pupil has been placed in this arm yet.',
    },
  ],
  form: [
    {
      title: 'Arm',
      fields: [
        {
          key: 'arm_name',
          label: 'Arm name',
          required: true,
          placeholder: 'JSS1 A',
          hint: 'Up to 10 characters, and unique within the class.',
        },
        { key: 'department_id', label: 'Class', required: true, optionsFrom: 'classes' },
        { key: 'class_teacher_id', label: 'Form teacher', optionsFrom: 'teachers' },
        { key: 'armstatus', label: 'Status', options: ARM_STATUSES },
        {
          key: 'arm_description',
          label: 'Description',
          multiline: true,
          wide: true,
          placeholder: 'Morning stream',
        },
      ],
    },
  ],
}

export const subjects: CollectionDef = {
  id: 'subjects',
  path: '/admin/subjects',
  kicker: 'Academics',
  title: 'Subjects',
  description:
    'The subject register, the class each subject belongs to and how many teachers carry it.',
  action: 'Create subject',
  searchHint: 'Search subject or code',
  footer: 'Subject register',
  emptyTitle: 'No subjects yet',
  emptyBody: 'Create a subject before assigning it to classes and teachers.',
  noun: 'subject',
  nameKey: 'name',
  counts: [
    { label: 'Offered', count: countSubjects(1) },
    { label: 'Withdrawn', count: countSubjects(0) },
    { label: 'Classes', count: countClasses },
  ],
  columns: [
    { key: 'code', label: 'Code', cardRole: 'subtitle' },
    { key: 'name', label: 'Subject', cardRole: 'title' },
    { key: 'klass', label: 'Home class' },
    { key: 'teachers', label: 'Teachers', align: 'right' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'name', label: 'Subject' },
    { key: 'code', label: 'Code' },
    { key: 'klass', label: 'Home class' },
    { key: 'credit', label: 'Credit load' },
    { key: 'staff', label: 'Taught by' },
    { key: 'status', label: 'Status' },
  ],
  filters: [
    { key: 'department_id', label: 'All classes', optionsFrom: 'classes' },
    { key: 'status', label: 'Any status', options: SUBJECT_STATUSES },
  ],
  source: async ({ page, q, filters }) => {
    const [{ items, pagination }, classNames] = await Promise.all([
      subjectsService.list({
        page,
        limit: PAGE_SIZE,
        q,
        department_id: asId(filters.department_id),
        // The endpoint takes 1 or 0, and no filter at all means both.
        status: filters.status ? (filters.status === 'Active' ? 1 : 0) : undefined,
      }),
      optionLabels('classes'),
    ])
    return { items: items.map((subject) => subjectRow(subject, classNames)), pagination }
  },
  record: async (recordId) => {
    const [subject, classNames] = await Promise.all([
      subjectsService.get(recordId),
      optionLabels('classes'),
    ])
    return subjectRow(subject, classNames)
  },
  save: (values, recordId) =>
    recordId
      ? subjectsService.update(recordId, subjectBody(values))
      : subjectsService.create(subjectBody(values)),
  tabs: [
    {
      label: 'Teachers',
      columns: [{ key: 'name', label: 'Teacher' }],
      source: async (recordId) => {
        const subject = await subjectsService.get(recordId)
        return (subject.teachers ?? []).map(subjectTeacherRow)
      },
      empty: 'Nobody carries this subject yet.',
    },
  ],
  form: [
    {
      title: 'Subject',
      fields: [
        { key: 'name', label: 'Name', required: true, wide: true, placeholder: 'Mathematics' },
        {
          key: 'subjectcode',
          label: 'Code',
          placeholder: 'MTH',
          hint: 'Generated from the name when left empty.',
        },
        {
          key: 'department_id',
          label: 'Home class',
          required: true,
          optionsFrom: 'classes',
          hint: 'The class it can never stop being taught to.',
        },
        { key: 'creditload', label: 'Credit load', numeric: true, placeholder: '3' },
      ],
    },
  ],
}

export const calendar: CollectionDef = {
  id: 'calendar',
  path: '/admin/calendar',
  kicker: 'Academics',
  title: 'Sessions & terms',
  description:
    'Academic sessions and the terms inside them. One session and one term are active at a time.',
  action: 'Create session',
  searchHint: 'Search session or term',
  footer: '6 records',
  emptyTitle: 'No sessions defined',
  emptyBody: 'Create a session before terms, fees or results can be recorded.',
  noun: 'session',
  nameKey: 'name',
  columns: [
    { key: 'name', label: 'Name', cardRole: 'title' },
    { key: 'type', label: 'Type', cardRole: 'subtitle' },
    { key: 'starts', label: 'Starts' },
    { key: 'ends', label: 'Ends' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'ca-1', name: '2025/2026', type: 'Session', starts: '15 Sep 2025', ends: '17 Jul 2026', state: 'Current' },
    { id: 'ca-2', name: 'First Term', type: 'Term', starts: '15 Sep 2025', ends: '12 Dec 2025', state: 'Current' },
    { id: 'ca-3', name: 'Second Term', type: 'Term', starts: '05 Jan 2026', ends: '27 Mar 2026', state: 'Upcoming' },
    { id: 'ca-4', name: 'Third Term', type: 'Term', starts: '20 Apr 2026', ends: '17 Jul 2026', state: 'Upcoming' },
    { id: 'ca-5', name: '2024/2025', type: 'Session', starts: '16 Sep 2024', ends: '18 Jul 2025', state: 'Closed' },
    { id: 'ca-6', name: '2023/2024', type: 'Session', starts: '18 Sep 2023', ends: '19 Jul 2024', state: 'Closed' },
  ],
  form: [
    {
      title: 'Session or term',
      fields: [
        { key: 'name', label: 'Name', required: true, wide: true, placeholder: '2025/2026' },
        { key: 'type', label: 'Type', required: true, options: ['Session', 'Term'] },
        { key: 'starts', label: 'Starts', required: true, date: true },
        { key: 'ends', label: 'Ends', required: true, date: true },
        { key: 'state', label: 'State', options: ['Upcoming', 'Current', 'Closed'] },
      ],
    },
  ],
}

export const results: CollectionDef = {
  id: 'results',
  path: '/admin/results',
  kicker: 'Academics',
  title: 'Results',
  description:
    'Result batches uploaded by teachers this term, with the state of each upload.',
  action: 'Upload results',
  searchHint: 'Search subject or teacher',
  footer: '6 batches · First Term',
  emptyTitle: 'No result batches',
  emptyBody: 'Batches appear here as teachers submit their score sheets.',
  noun: 'batch',
  nameKey: 'batch',
  summary: [
    { label: 'Batches uploaded', value: '48' },
    { label: 'Awaiting approval', value: '6' },
    { label: 'Class average', value: '61.4' },
  ],
  columns: [
    { key: 'batch', label: 'Batch', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'arm', label: 'Arm' },
    { key: 'teacher', label: 'Uploaded by' },
    { key: 'scores', label: 'Scores', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 're-1', batch: 'BAT-1142', subject: 'Mathematics', arm: 'SS1 A', teacher: 'C. Nnaji', scores: '35', state: 'Approved' },
    { id: 're-2', batch: 'BAT-1140', subject: 'English Language', arm: 'JSS1 A', teacher: 'A. Mohammed', scores: '44', state: 'Approved' },
    { id: 're-3', batch: 'BAT-1138', subject: 'Biology', arm: 'SS3 A', teacher: 'R. Obiora', scores: '31', state: 'Awaiting approval' },
    { id: 're-4', batch: 'BAT-1135', subject: 'Computer Studies', arm: 'JSS3 C', teacher: 'E. Duru', scores: '39', state: 'Awaiting approval' },
    { id: 're-5', batch: 'BAT-1129', subject: 'Basic Science', arm: 'Primary 4 A', teacher: 'P. Akpan', scores: '41', state: 'Approved' },
    { id: 're-6', batch: 'BAT-1121', subject: 'Further Mathematics', arm: 'SS2 A', teacher: 'C. Nnaji', scores: '18', state: 'Rejected' },
  ],
}
