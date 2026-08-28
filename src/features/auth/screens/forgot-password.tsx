import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import { TextField } from '@/components/form/text-field'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useRecordForm } from '@/hooks/use-record-form'
import { useAuthStore } from '../auth.store'
import { AuthHeading } from '../components/auth-heading'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas'

export function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const identify = useAuthStore((state) => state.identify)
  const form = useRecordForm<ForgotPasswordValues>(forgotPasswordSchema, {
    email: '',
  })

  return (
    <>
      <Button asChild variant="ghost" className="mb-4 px-0 text-brand">
        <Link to="/sign-in">
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to sign in
        </Link>
      </Button>

      <AuthHeading
        kicker="Reset"
        title="Forgotten password"
        description="Enter the address on your account. We send a link that works once and expires after an hour."
      />
      <Rule />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            identify(values.email)
            await navigate({ to: '/check-email' })
          })}
          noValidate
          className="flex flex-col gap-[18px]"
        >
          <TextField<ForgotPasswordValues>
            name="email"
            label="Email address"
            type="email"
            placeholder="you@school.ng"
            hint="The address the school has on file"
            required
          />
          <Button type="submit" className="w-full justify-start">
            Send the reset link
          </Button>
        </form>
      </FormProvider>

      <Rule />
      <div className="text-[12.5px] leading-relaxed text-muted-foreground">
        No email arrives if the address is not on an account. The school office
        can tell you which address is registered.
      </div>
    </>
  )
}
