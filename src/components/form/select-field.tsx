import { type FieldValues, type Path, useController, useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldShell, type FieldSpan } from './field-shell'

export function SelectField<TValues extends FieldValues>({
  name,
  label,
  options,
  hint,
  required,
  span,
  placeholder,
}: {
  name: Path<TValues>
  label: string
  options: readonly string[]
  hint?: string
  required?: boolean
  span?: FieldSpan
  placeholder?: string
}) {
  const { control } = useFormContext<TValues>()
  const { field, fieldState } = useController({ control, name })
  const error = fieldState.error?.message

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
      span={span}
    >
      <Select value={field.value ?? ''} onValueChange={field.onChange}>
        <SelectTrigger
          id={name}
          className="w-full"
          aria-invalid={Boolean(error)}
          onBlur={field.onBlur}
        >
          <SelectValue placeholder={placeholder ?? 'Choose one'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}
