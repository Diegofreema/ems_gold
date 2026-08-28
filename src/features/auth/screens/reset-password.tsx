import { useNavigate } from '@tanstack/react-router'
import { FormProvider } from 'react-hook-form'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useRecordForm } from '@/hooks/use-record-form'
import { useAuthStore } from '../auth.store'
import { AuthHeading } from '../components/auth-heading'
import { PasswordInput } from '../components/password-input'
import { PasswordRules } from '../components/password-rules'
import { PasswordStrength } from '../components/password-strength'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas'

const COPY = {
  reset: {
    kicker: 'Reset',
    title: 'Set a new password',
    description:
      'Choose something you have not used here before. It takes effect straight away.',
    cta: 'Save the new password',
  },
  first: {
    kicker: 'First sign in',
    title: 'Choose your password',
    description:
      'The office gave you a temporary password. Replace it now — the temporary one stops working as soon as you save.',
    cta: 'Save and continue',
  },
} as const

/** Serves both the reset link and the first-sign-in variant. */
export function ResetPasswordScreen({ first }: { first: boolean }) {
  const navigate = useNavigate()
  const setPasswordChanged = useAuthStore((state) => state.setPasswordChanged)
  const copy = first ? COPY.first : COPY.reset

  const form = useRecordForm<ResetPasswordValues>(resetPasswordSchema, {
    temporaryPassword: '',
    password: '',
    confirmPassword: '',
  })

  const password = form.watch('password') ?? ''

  return (
    <>
      <AuthHeading
        kicker={copy.kicker}
        title={copy.title}
        description={copy.description}
      />
      <Rule />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(async () => {
            setPasswordChanged(true)
            await navigate({ to: '/signed-in' })
          })}
          noValidate
          className="flex flex-col gap-[18px]"
        >
          {first && (
            <PasswordInput<ResetPasswordValues>
              name="temporaryPassword"
              label="Temporary password"
              placeholder="From your invitation email"
              hint="The one the office gave you"
            />
          )}

          <div>
            <PasswordInput<ResetPasswordValues>
              name="password"
              label="New password"
              placeholder="At least 10 characters"
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput<ResetPasswordValues>
            name="confirmPassword"
            label="Repeat the new password"
            placeholder="Type it again"
            hint="Both must be identical"
          />

          <PasswordRules password={password} />

          <Button type="submit" className="w-full justify-start">
            {copy.cta}
          </Button>
        </form>
      </FormProvider>
    </>
  )
}
