import { FormProvider } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormErrorBanner } from '@/components/form/form-error-banner'
import { TextField } from '@/components/form/text-field'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useRecordForm } from '@/hooks/use-record-form'

const schema = z.object({
  to: z.string().trim().min(1, 'Required'),
  subject: z.string().trim().min(1, 'Required'),
  body: z
    .string()
    .trim()
    .min(10, 'Write at least a line — ten characters or more.'),
})

type Values = z.infer<typeof schema>

export type MessageTarget = {
  title: string
  description: string
  toLabel: string
  toValue: string
  /** Sits under the message box, e.g. who will receive it. */
  bodyHint: string
}

/** Compose a message to the office or to a whole arm. */
export function MessageForm({ target }: { target: MessageTarget }) {
  const form = useRecordForm<Values>(schema, {
    to: target.toValue,
    subject: '',
    body: '',
  })

  return (
    <div className="max-w-[640px]">
      <PageHeader
        kicker="Messages"
        title={target.title}
        description={target.description}
      />
      <Rule />

      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(() => {
            toast('Message sent')
            form.reset({ to: target.toValue, subject: '', body: '' })
          })}
        >
          <FormErrorBanner count={Object.keys(form.formState.errors).length} />

          <div className="flex flex-col gap-4">
            <TextField<Values> name="to" label={target.toLabel} required />
            <TextField<Values>
              name="subject"
              label="Subject"
              required
              placeholder="One line — what this is about"
            />
            <TextField<Values>
              name="body"
              label="Message"
              required
              multiline
              hint={target.bodyHint}
            />

            <div className="flex gap-2.5">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Send message
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast('Draft saved locally')}
              >
                Save draft
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
