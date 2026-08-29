/** What a select submits and what it shows. The value is the API's own id. */
export type Option = { value: string; label: string }

/**
 * The feeds shared across the record forms. A field names one of these rather
 * than listing choices, so every form offers the same classes, arms and
 * guardians the API knows about.
 */
export type OptionsKey = 'classes' | 'arms' | 'guardians' | 'teachers'

/** Choices whose value is the text itself — a gender, a status, a term. */
export function toOptions(labels: readonly string[]): Option[] {
  return labels.map((label) => ({ value: label, label }))
}
