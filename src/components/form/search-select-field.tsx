import { useQuery } from '@tanstack/react-query'
import { CheckIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { type FieldValues, type Path, useController, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { searchOptionsQuery } from '@/features/collections/option-feeds'
import type { SearchKey } from '@/features/collections/options'
import { useDebounced } from '@/hooks/use-debounced'
import { cn } from '@/lib/utils'
import { FieldShell, type FieldSpan } from './field-shell'

/** The trigger wears the select's own clothes, so the two read as one control. */
const TRIGGER =
  'flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20'

/** What the box says for each feed — who is searched, and how to ask. */
const WORDING: Record<
  SearchKey,
  { trigger: string; input: string; empty: string }
> = {
  guardians: {
    trigger: 'Search for a guardian',
    input: 'Father or mother’s name',
    empty: 'No guardian by that name.',
  },
  students: {
    trigger: 'Search for a student',
    input: 'Student’s name',
    empty: 'No student by that name.',
  },
}

/**
 * A select whose feed is too long to open whole — every guardian or student in
 * the school.
 *
 * The office types a name instead of scrolling a list of hundreds; the box
 * waits for the typing to settle (`useDebounced`) and then asks the endpoint
 * with `q`, so a search costs one request rather than one per keystroke. The
 * value it submits is the record's id, the same as the ordinary select.
 *
 * On an edit the id is already set but its name is not in any loaded page, so
 * the label the record carried is shown until the office picks another.
 */
export function SearchSelectField<TValues extends FieldValues>({
  name,
  label,
  from,
  hint,
  required,
  span,
  placeholder,
  initialLabel,
}: {
  name: Path<TValues>
  label: string
  from: SearchKey
  hint?: string
  required?: boolean
  span?: FieldSpan
  placeholder?: string
  /** The chosen record's name as the row already knew it, for an edit. */
  initialLabel?: string
}) {
  const { control } = useFormContext<TValues>()
  const { field, fieldState } = useController({ control, name })
  const error = fieldState.error?.message

  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [chosen, setChosen] = useState(initialLabel ?? '')
  const settled = useDebounced(term)

  // Asked for only while the popover is open, and re-asked as the settled term
  // changes under it — a closed field costs nothing.
  const { data, isPending, isError, isFetching } = useQuery({
    ...searchOptionsQuery(from, settled),
    enabled: open,
  })
  const results = data ?? []
  const loading = isPending || isFetching

  const wording = WORDING[from]

  const pick = (value: string, optionLabel: string) => {
    field.onChange(value)
    setChosen(optionLabel)
    setOpen(false)
    setTerm('')
  }

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
          <button
            type="button"
            id={name}
            aria-invalid={Boolean(error)}
            onBlur={field.onBlur}
            className={cn(TRIGGER, !chosen && 'text-muted-foreground')}
          >
            <span className="line-clamp-1">
              {chosen || placeholder || wording.trigger}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) gap-0 p-0"
          align="start"
        >
          <div className="border-b border-divider p-2">
            <Input
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={wording.input}
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {loading ? (
              <p className="px-2.5 py-2 text-sm text-muted-foreground">Searching…</p>
            ) : isError ? (
              <p className="px-2.5 py-2 text-sm text-muted-foreground">
                That search could not run. Try again.
              </p>
            ) : results.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-muted-foreground">
                {settled ? wording.empty : 'Type a name to search.'}
              </p>
            ) : (
              results.map((option) => {
                const active = option.value === field.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => pick(option.value, option.label)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.75 text-left text-sm transition-colors hover:bg-neutral-100',
                      active && 'font-medium',
                    )}
                  >
                    <span className="line-clamp-1">{option.label}</span>
                    {active && <CheckIcon className="size-4 shrink-0 text-brand" />}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}
