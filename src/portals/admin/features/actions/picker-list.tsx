import { Check } from 'lucide-react'
import { type FieldValues, type Path, useController, useFormContext } from 'react-hook-form'
import { SectionHeading } from '@/components/common/section-heading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PickerSpec } from './types'

/** The rows a flow acts on: class arms, pupils, documents on file. */
export function PickerList<TValues extends FieldValues>({
  name,
  picker,
}: {
  name: Path<TValues>
  picker: PickerSpec
}) {
  const { control, getValues } = useFormContext<TValues>()
  const { field, fieldState } = useController({ control, name })
  const picked: string[] = field.value ?? []
  const allOn = picked.length === picker.items.length

  // Read the live value rather than this render's, so two taps in quick
  // succession both land — a lost pick here is an arm that never gets billed.
  const toggle = (key: string) => {
    const current: string[] = getValues(name) ?? []
    field.onChange(
      current.includes(key)
        ? current.filter((one) => one !== key)
        : [...current, key],
    )
  }

  return (
    <div className="mb-[26px]">
      <SectionHeading
        className="mb-3.5"
        action={
          <Button
            type="button"
            variant="ghost"
            className="h-auto px-1 py-0 text-xs text-brand"
            onClick={() =>
              field.onChange(allOn ? [] : picker.items.map((item) => item.key))
            }
          >
            {allOn ? 'Clear all' : 'Select all'}
          </Button>
        }
      >
        {picker.title}
      </SectionHeading>

      <div className="border-2 border-divider">
        {picker.items.map((item, index) => {
          const on = picked.includes(item.key)
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(item.key)}
              style={{ animationDelay: `${index * 26}ms` }}
              className={cn(
                'flex w-full animate-ems-row cursor-pointer items-center gap-3.5 border-b border-divider px-[15px] py-[13px] text-left text-sm transition-colors last:border-b-0 hover:bg-neutral-200',
                on && 'bg-brand/9',
              )}
            >
              <span
                className={cn(
                  'grid size-[18px] flex-none place-items-center border-2',
                  on ? 'border-brand bg-brand' : 'border-divider',
                )}
              >
                {on && (
                  <Check
                    className="size-3 text-background"
                    strokeWidth={3.4}
                  />
                )}
              </span>
              <span className="flex-1 font-semibold">{item.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {item.meta}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'mt-2.5 text-xs',
          fieldState.error ? 'text-brand-700' : 'text-muted-foreground',
        )}
      >
        {fieldState.error?.message ?? picker.note}
      </div>
    </div>
  )
}
