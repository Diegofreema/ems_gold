import { toast } from 'sonner'
import { z } from 'zod'
import { FormSection } from '@/components/form/form-section'
import { RecordForm } from '@/components/form/record-form'
import { TextField } from '@/components/form/text-field'
import { useRecordForm } from '@/hooks/use-record-form'

const FIELDS = [
  { key: 'schoolName', label: 'School name', hint: 'Appears on every invoice and receipt.' },
  { key: 'shortName', label: 'Short name', hint: 'Used in admission numbers.' },
  { key: 'session', label: 'Current session', hint: 'Records are filed under this session.' },
  { key: 'term', label: 'Current term', hint: 'Ends 12 December 2025.' },
  { key: 'bursaryEmail', label: 'Bursary email', hint: 'Receives payment notifications.' },
  { key: 'admissionPrefix', label: 'Admission prefix', hint: 'NEB/2025/0001 and upward.' },
] as const

const schema = z.object({
  schoolName: z.string().trim().min(1, 'Required'),
  shortName: z.string().trim().min(1, 'Required'),
  session: z.string().trim().min(1, 'Required'),
  term: z.string().trim().min(1, 'Required'),
  bursaryEmail: z.email('That does not look like an email address'),
  admissionPrefix: z.string().trim().min(1, 'Required'),
})

type Values = z.infer<typeof schema>

const CURRENT: Values = {
  schoolName: 'NETPRO EMS Bronze',
  shortName: 'NEB',
  session: '2025/2026',
  term: 'First Term',
  bursaryEmail: 'bursary@netpro.africa',
  admissionPrefix: 'NEB/',
}

export function SettingsForm() {
  const form = useRecordForm<Values>(schema, CURRENT)

  return (
    <div className="max-w-[720px]">
      <RecordForm
        form={form}
        kicker="School"
        title="Settings"
        description="Identity, the active session and the active term. Changing the active term affects every fee, result and attendance record created afterwards."
        submitLabel="Save settings"
        onSubmit={() => {
          toast('Settings saved')
        }}
        onCancel={() => form.reset(CURRENT)}
      >
        <FormSection title="School identity">
          {FIELDS.map((field) => (
            <TextField<Values>
              key={field.key}
              name={field.key}
              label={field.label}
              hint={field.hint}
            />
          ))}
        </FormSection>
      </RecordForm>
    </div>
  )
}
