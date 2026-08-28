import { paginated, request, toFormData } from '../client'
import type { Id } from '../types'
import type {
  CreateTopicBody,
  EClass,
  EnterScoreBody,
  MessageAdminBody,
  MessageStudentsBody,
  MyResultParams,
  RegisteredStudentParams,
  ResultRow,
  Teacher,
  TeacherDashboard,
  TeacherStudent,
  TeacherSubject,
  Topic,
  UpdateMyTeachingProfileBody,
  UpdateTopicBody,
  UploadBatch,
  UploadBatchKey,
  UploadResultsBody,
} from './types'

/** Everything under `/teachers/me` — the caller is resolved from the token. */
export const teachingService = {
  profile: () => request<{ teacher: Teacher }>('teachers/me').then((data) => data.teacher),

  updateProfile: (body: UpdateMyTeachingProfileBody) =>
    request<{ teacher: Teacher }>('teachers/me', { method: 'POST', form: toFormData(body) }),

  dashboard: () => request<TeacherDashboard>('teachers/me/dashboard'),

  subjects: () =>
    request<{ subjects: TeacherSubject[] }>('teachers/me/subjects').then(
      (data) => data.subjects,
    ),

  /** Empty when no arm is assigned — it never falls back to the whole school. */
  students: (params: { page?: number; limit?: number } = {}) =>
    request<Record<string, unknown>>('teachers/me/students', { query: { ...params } }).then(
      (data) => paginated<TeacherStudent>(data, 'students'),
    ),

  eclasses: () =>
    request<{ eclasses: EClass[] }>('teachers/me/eclasses').then((data) => data.eclasses),

  registeredStudents: (params: RegisteredStudentParams) =>
    request<{ students: TeacherStudent[] }>('teachers/me/registered-students', {
      query: { ...params },
    }).then((data) => data.students),

  messageAdmin: (body: MessageAdminBody) =>
    request<unknown>('teachers/me/message-admin', { method: 'POST', body }),

  messageStudents: (body: MessageStudentsBody) =>
    request<unknown>('teachers/me/message-students', { method: 'POST', body }),

  uploadResults: (body: UploadResultsBody) =>
    request<unknown>('teachers/me/uploads', { method: 'POST', form: toFormData(body) }),

  /** Uploads grouped by subject / class / term / session, with approval status. */
  uploadBatches: () =>
    request<{ uploads: UploadBatch[] }>('teachers/me/uploads').then((data) => data.uploads),

  uploadBatch: ({ subjectId, departmentId, semesterId, sessionId }: UploadBatchKey) =>
    request<{ results: ResultRow[] }>(
      `teachers/me/uploads/${subjectId}/${departmentId}/${semesterId}/${sessionId}`,
    ).then((data) => data.results),

  /** Always confined to the caller's own subjects. */
  results: (params: MyResultParams = {}) =>
    request<Record<string, unknown>>('teachers/me/results', { query: { ...params } }).then(
      (data) => paginated<ResultRow>(data, 'results'),
    ),

  /** Creates or updates one result. */
  enterScore: (body: EnterScoreBody) =>
    request<unknown>('teachers/me/scores', { method: 'POST', body }),

  topics: () => request<{ topics: Topic[] }>('teachers/me/topics').then((data) => data.topics),

  /** Refused with 403 if the subject is not the caller's. */
  addTopic: (body: CreateTopicBody) =>
    request<{ topic: Topic }>('teachers/me/topics', { method: 'POST', body }),

  updateTopic: (id: Id, body: UpdateTopicBody) =>
    request<{ topic: Topic }>(`teachers/me/topics/${id}`, { method: 'POST', body }),
}
