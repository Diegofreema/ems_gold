import type { Paginated, Pagination } from './types.ts'

export type QueryValue = string | number | boolean | null | undefined

/**
 * Joins the base and the path and appends the query. An empty filter means
 * "no filter" to this API, so it is left off entirely rather than sent as
 * `?status=` — which the server would try to match against.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const url = new URL(
    path.replace(/^\//, ''),
    baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`,
  )
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

/**
 * Narrows a list envelope to `{ items, pagination }`. `key` is the property
 * the endpoint puts its array under; endpoints that page nothing are given a
 * single page covering everything they returned.
 */
export function paginated<TItem>(
  data: Record<string, unknown>,
  key: string,
): Paginated<TItem> {
  const items = (data[key] ?? []) as TItem[]
  return {
    items,
    pagination: (data.pagination as Pagination | undefined) ?? {
      page: 1,
      limit: items.length,
      total: items.length,
      pages: 1,
    },
  }
}
