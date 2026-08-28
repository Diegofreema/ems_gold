import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { type FieldValues, type Path, useController, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FieldShell, type FieldSpan } from './field-shell'

export function DateField<TValues extends FieldValues>({
  name,
  label,
  hint,
  required,
  span,
  placeholder = 'Pick a date',
}: {
  name: Path<TValues>
  label: string
  hint?: string
  required?: boolean
  span?: FieldSpan
  placeholder?: string
}) {
  const { control } = useFormContext<TValues>()
  const { field, fieldState } = useController({ control, name })
  const [open, setOpen] = useState(false)
  const error = fieldState.error?.message
  const value = field.value as Date | undefined

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      error={error}
      required={required}
      span={span}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            type="button"
            variant="outline"
            aria-invalid={Boolean(error)}
            className={cn(
              'h-9 w-full justify-between px-2.5 font-body text-sm font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            {value ? formatDate(value) : placeholder}
            <CalendarIcon className="size-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            // Without this the picker opens on today even when a date is set.
            defaultMonth={value}
            onSelect={(date) => {
              field.onChange(date)
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}
