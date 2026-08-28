import { useState } from 'react'
import { type FieldValues, type Path, useController, useFormContext } from 'react-hook-form'
import { FieldShell } from '@/components/form/field-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** A password field with the design's Show/Hide button beside it. */
export function PasswordInput<TValues extends FieldValues>({
  name,
  label,
  hint,
  placeholder,
  required = true,
}: {
  name: Path<TValues>
  label: string
  hint?: string
  placeholder?: string
  required?: boolean
}) {
  const { control } = useFormContext<TValues>()
  const { field, fieldState } = useController({ control, name })
  const [visible, setVisible] = useState(false)
  const error = fieldState.error?.message

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <div className="flex gap-2">
        <Input
          {...field}
          id={name}
          value={field.value ?? ''}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="flex-none"
          onClick={() => setVisible((previous) => !previous)}
        >
          {visible ? 'Hide' : 'Show'}
        </Button>
      </div>
    </FieldShell>
  )
}
