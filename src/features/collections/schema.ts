import { z, type ZodType } from 'zod'
import type { FieldSpec, FormSectionSpec } from './types.ts'

/** The design accepts digits, separators and spaces in a numeric field. */
const NUMERIC = /^[0-9,.\s]+$/

function schemaForField(field: FieldSpec): ZodType {
  if (field.multi) {
    const many = z.array(z.string())
    return field.required ? many.min(1, 'Pick at least one') : many
  }

  if (field.date) {
    return field.required
      ? z.date({ message: 'Required' })
      : z.date().optional()
  }

  let text = z.string().trim()
  if (field.required) text = text.min(1, 'Required')

  let schema: ZodType = text
  if (field.email) {
    schema = text.refine(
      (value) => !value || z.email().safeParse(value).success,
      'That does not look like an email address',
    )
  } else if (field.numeric || field.money) {
    schema = text.refine(
      (value) => !value || NUMERIC.test(value),
      'Numbers only',
    )
  }

  return field.required ? schema : schema.optional()
}

/** Builds one validator for a whole form definition. */
export function schemaFromSections(sections: FormSectionSpec[]) {
  const shape: Record<string, ZodType> = {}
  for (const section of sections) {
    for (const field of section.fields) {
      shape[field.key] = schemaForField(field)
    }
  }
  return z.object(shape)
}
