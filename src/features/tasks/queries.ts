import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { api, type TaskFilters } from '@/lib/api'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters: TaskFilters) => [...taskKeys.all, 'list', filters] as const,
}

export const tasksQueryOptions = (filters: TaskFilters) =>
  queryOptions({
    queryKey: taskKeys.list(filters),
    queryFn: () => api.listTasks(filters),
    placeholderData: keepPreviousData,
  })
