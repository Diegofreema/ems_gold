import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { SectionHeading } from '@/components/common/section-heading'
import { FieldShell } from '@/components/form/field-shell'
import { TextField } from '@/components/form/text-field'
import { Button } from '@/components/ui/button'
import type { ProfileConfig, ProfileField } from '../types'

export type ProfileValues = Record<string, unknown>

/** A field the office controls: the value, boxed, with no way to type into it. */
function LockedField({ field, value }: { field: ProfileField; value: string }) {
  return (
    <FieldShell
      name={field.key}
      label={field.label}
      hint="Set by the school office"
      span={field.wide ? 2 : undefined}
    >
      <div className="border-2 border-divider bg-neutral-100 px-3 py-[9px] text-sm text-neutral-700">
        {value}
      </div>
    </FieldShell>
  )
}

export function PersonalDetails({
  form,
  note,
  fields,
  values,
}: {
  form: UseFormReturn<ProfileValues>
  note: ProfileConfig['note']
  fields: ProfileField[]
  values: ProfileConfig['values']
}) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(() => toast('Your details were saved'))}
        noValidate
      >
        <SectionHeading className="mb-4">Personal details</SectionHeading>
        <p className="mb-4 text-[13px] text-muted-foreground">{note}</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
          {fields.map((field) =>
            field.locked ? (
              <LockedField
                key={field.key}
                field={field}
                value={values[field.key]}
              />
            ) : (
              <TextField<ProfileValues>
                key={field.key}
                name={field.key}
                label={field.label}
                span={field.wide ? 2 : undefined}
                type={field.email ? 'email' : 'text'}
              />
            ),
          )}
        </div>

        <div className="mt-[22px] flex flex-wrap gap-2.5">
          <Button type="submit">Save changes</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset()
              toast('Your edits were undone')
            }}
          >
            Undo my edits
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
