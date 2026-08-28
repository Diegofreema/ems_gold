import type { CollectionDef, CollectionRoutes, FlowSpec } from './types.ts'

/**
 * Some primary actions hand the reader a file rather than opening a form —
 * "Export CSV", "Download result sheet". The design keys this off the verb, so
 * a collection declares the label and the behaviour follows.
 */
export function isFileAction(action: string): boolean {
  return /^(Export|Download)\b/.test(action)
}

export function fileActionToast(action: string): string {
  return `${action} — file will download`
}

export type PrimaryActionKind = 'file' | 'flow' | 'create' | 'link' | 'none'

/**
 * What a list's primary button does. The list renders from this and the create
 * route refuses anything but `create`, so a collection can never show a button
 * that skips the create form while still leaving that form reachable by URL.
 */
export function primaryActionKind(
  definition: CollectionDef,
  routes: CollectionRoutes,
  flow?: FlowSpec,
): PrimaryActionKind {
  if (isFileAction(definition.action)) return 'file'
  if (routes.flow && flow?.fromList) return 'flow'
  if (routes.create) return 'create'
  if (definition.actionTo) return 'link'
  return 'none'
}
