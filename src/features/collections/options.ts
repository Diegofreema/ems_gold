/** What a select submits and what it shows. The value is the API's own id. */
export type Option = { value: string; label: string }

/**
 * The feeds shared across the record forms. A field names one of these rather
 * than listing choices, so every form offers the same classes, arms and
 * guardians the API knows about.
 */
export type OptionsKey =
  | 'classes'
  | 'arms'
  | 'guardians'
  | 'teachers'
  | 'students'
  | 'fees'
  /** The four ways the school takes money at the counter. */
  | 'payment-methods'

/**
 * A choice as a definition writes it: a bare string where the value and the
 * label are the same word, and a pair where they differ — the invoice status
 * the API calls `success` is the one an office calls Paid.
 */
export type Choice = string | Option

/** Choices whose value is the text itself — a gender, a status, a term. */
export function toOptions(choices: readonly Choice[]): Option[] {
  return choices.map((choice) =>
    typeof choice === 'string' ? { value: choice, label: choice } : choice,
  )
}
