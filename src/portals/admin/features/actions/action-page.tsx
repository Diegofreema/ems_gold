import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { DateField } from '@/components/form/date-field'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import { schemaFromSections } from '@/features/collections/schema'
import type { CollectionDef } from '@/features/collections/types'
import { useConfirm } from '@/hooks/use-confirm'
import { useRecordForm } from '@/hooks/use-record-form'
import { formatNaira } from '@/lib/format'
import { z } from 'zod'
import { PickerList } from './picker-list'
import { billing } from './total'
import type { ActionDef, ActionField } from './types'

type Values = Record<string, unknown>

function schemaFor(action: ActionDef) {
  const picks = action.picker?.requiredMessage
    ? z.array(z.string()).min(1, action.picker.requiredMessage)
    : z.array(z.string())
  return schemaFromSections([{ title: action.title, fields: action.fields }])
    .extend({ picks })
}

function defaultsFor(action: ActionDef): Values {
  const values: Values = { picks: action.picker?.preselected ?? [] }
  for (const field of action.fields) {
    values[field.key] = field.value ?? (field.options?.[0] ?? '')
  }
  return values
}

function renderField(field: ActionField) {
  const shared = {
    name: field.key,
    label: field.label,
    hint: field.hint,
    required: field.required,
    span: field.wide ? (2 as const) : undefined,
  }
  if (field.date) return <DateField<Values> key={field.key} {...shared} />
  if (field.options)
    return <SelectField<Values> key={field.key} {...shared} options={field.options} />
  return (
    <TextField<Values> key={field.key} {...shared} placeholder={field.placeholder} />
  )
}

/**
 * The guided flows: allocating a fee, taking a payment, promoting pupils,
 * reviewing an application, issuing a book. One page — they differ only in
 * what they summarise, what they ask to be picked and what they ask for.
 */
export function ActionPage({
  definition,
  action,
}: {
  definition: CollectionDef
  action: ActionDef
}) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const form = useRecordForm<Values>(schemaFor(action), defaultsFor(action))
  const picked = (form.watch('picks') as string[] | undefined) ?? []

  const back = () => navigate({ to: definition.path })
  const run = async () => {
    toast(action.done(picked.length))
    await navigate({ to: definition.path })
  }

  // Allocate shows what the picked arms will actually bill, live.
  const total =
    action.unitAmount !== undefined && action.picker
      ? billing(action.picker.items, picked, action.unitAmount)
      : undefined
  const tiles = [
    ...action.summary,
    ...(total
      ? [
          { label: 'Pupils selected', value: String(total.pupils) },
          { label: 'Will bill', value: formatNaira(total.amount) },
        ]
      : []),
  ]

  return (
    <div className="max-w-[760px]">
      <Button asChild variant="ghost" className="mb-3.5 px-1 text-brand">
        <Link to={definition.path}>
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Cancel and go back
        </Link>
      </Button>

      <PageHeader
        kicker={action.kicker}
        title={action.title}
        description={action.description}
      />
      <Rule />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(() => {
            // Validation has passed; a flow that commits money asks once more.
            const ask = action.confirm && total ? action.confirm(total) : undefined
            if (!ask) return run()
            confirm.ask({ ...ask, onConfirm: () => void run() })
          })}
          noValidate
        >
          {tiles.length > 0 && <TileStrip className="mb-[26px]" tiles={tiles} />}

          {action.picker && (
            <PickerList<Values> name="picks" picker={action.picker} />
          )}

          <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
            {action.fields.map(renderField)}
          </div>

          <Rule />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {action.cta}
            </Button>
            <Button type="button" variant="outline" onClick={back}>
              Cancel
            </Button>
            <div className="flex-1" />
            <div className="text-[12.5px] text-muted-foreground">
              {action.footnote}
            </div>
          </div>
        </form>
      </FormProvider>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </div>
  )
}
