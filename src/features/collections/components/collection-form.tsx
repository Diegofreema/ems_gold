import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DateField } from '@/components/form/date-field'
import { FormSection } from '@/components/form/form-section'
import { RecordForm } from '@/components/form/record-form'
import { RemoteSelectField } from '@/components/form/remote-select-field'
import { SelectField } from '@/components/form/select-field'
import { toOptions } from '@/features/collections/options'
import { TextField } from '@/components/form/text-field'
import { ConfirmDialog } from '@/components/feedback/confirm-dialog'
import { useConfirm } from '@/hooks/use-confirm'
import { useRecordForm } from '@/hooks/use-record-form'
import { BLANK } from '../blank'
import { schemaFromSections } from '../schema'
import { useSaveRecord } from '../use-save-record'
import type {
  CollectionDef,
  CollectionRoutes,
  FieldSpec,
  FormSectionSpec,
  Row,
} from '../types'

type Values = Record<string, unknown>

function renderField(field: FieldSpec) {
  const shared = {
    name: field.key,
    label: field.label,
    hint: field.hint,
    required: field.required,
    span: field.wide ? (2 as const) : undefined,
  }

  if (field.date)
    return <DateField<Values> key={field.key} {...shared} past={field.past} />
  if (field.optionsFrom)
    return (
      <RemoteSelectField<Values>
        key={field.key}
        {...shared}
        from={field.optionsFrom}
        dependsOn={field.dependsOn}
      />
    )
  if (field.options)
    return (
      <SelectField<Values>
        key={field.key}
        {...shared}
        options={toOptions(field.options)}
      />
    )
  return (
    <TextField<Values>
      key={field.key}
      {...shared}
      placeholder={field.placeholder}
      type={field.email ? 'email' : 'text'}
      multiline={field.multiline}
    />
  )
}

/** Create or edit any collection record from its form definition. */
export function CollectionForm({
  definition,
  record,
  routes,
}: {
  definition: CollectionDef
  /** Absent when creating. */
  record?: Row
  routes: CollectionRoutes
}) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const sections = definition.form ?? fallbackSections(definition)

  const defaults: Values = {}
  for (const section of sections) {
    for (const field of section.fields) {
      // A blank is how the record reads, not what it holds — typing over an
      // em dash, or saving one back, is nobody's intent.
      const held = record?.[field.key]
      defaults[field.key] = field.date ? undefined : (held === BLANK ? '' : (held ?? ''))
    }
  }

  const form = useRecordForm<Values>(schemaFromSections(sections), defaults)
  const editing = Boolean(record)
  const save = useSaveRecord(definition, editing)
  const back = () =>
    record
      ? navigate({
          to: routes.record,
          params: { collection: definition.id, recordId: record.id },
        })
      : navigate({ to: definition.path })

  return (
    <>
      <RecordForm
        form={form}
        kicker={`${definition.kicker} · ${definition.title}`}
        title={editing ? `Edit ${definition.noun}` : definition.action}
        description={
          editing
            ? 'Changes take effect as soon as you save.'
            : `Nothing is saved until you press ${definition.action.toLowerCase()}.`
        }
        submitLabel={editing ? 'Save changes' : definition.action}
        onSubmit={async (values) => {
          if (definition.save) {
            // A refusal has already been announced by the mutation cache;
            // swallowing it here only keeps the form open on the values typed.
            const saved = await save
              .mutateAsync({ values, recordId: record?.id })
              .catch(() => null)
            if (!saved) return
          } else {
            toast(editing ? 'Changes saved' : `${definition.noun} created`)
          }
          back()
        }}
        onCancel={back}
        deleteLabel={editing ? 'Delete this record' : undefined}
        onDelete={
          editing
            ? () =>
                confirm.ask({
                  title: `Delete this ${definition.noun}?`,
                  body: 'This removes the record from the register. Anything already raised against it stays in the audit log.',
                  subject: record?.[definition.nameKey] ?? '',
                  cta: `Delete the ${definition.noun}`,
                  onConfirm: () => {
                    toast(`${record?.[definition.nameKey]} deleted`)
                    void navigate({ to: definition.path })
                  },
                })
            : undefined
        }
      >
        {sections.map((section) => (
          <FormSection key={section.title} title={section.title}>
            {section.fields.map(renderField)}
          </FormSection>
        ))}
      </RecordForm>

      <ConfirmDialog request={confirm.request} onOpenChange={confirm.setOpen} />
    </>
  )
}

/** Collections without a bespoke form fall back to one field per column. */
function fallbackSections(definition: CollectionDef): FormSectionSpec[] {
  return [
    {
      title: 'Details',
      fields: definition.columns.map((column, index) => ({
        key: column.key,
        label: column.label,
        required: index === 0,
      })),
    },
  ]
}
