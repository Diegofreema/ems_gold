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
