import { Link, useNavigate } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { TextField } from '@/components/form/text-field'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRecordForm } from '@/hooks/use-record-form'
import { useAuthStore } from '../auth.store'
import { AuthAlert } from '../components/auth-alert'
import { AuthHeading } from '../components/auth-heading'
import { PasswordInput } from '../components/password-input'
import { portalFor, roleForEmail } from '../role'
import { signInSchema, type SignInValues } from '../schemas'

/** Stands in for the real sign-in call; see the prototype's demo rules. */
const TEMPORARY_PASSWORDS = ['temp', 'temporary']

export function SignInScreen() {
  const navigate = useNavigate()
  const identify = useAuthStore((state) => state.identify)
  const [failed, setFailed] = useState(false)

  const form = useRecordForm<SignInValues>(signInSchema, {
    email: '',
    password: '',
    remember: false,
  })

  const onSubmit = async (values: SignInValues) => {
    setFailed(false)
    identify(values.email)
    await new Promise((resolve) => setTimeout(resolve, 700))

    if (/^guest@/i.test(values.email.trim())) {
      await navigate({ to: '/wrong-portal' })
      return
    }
    if (TEMPORARY_PASSWORDS.includes(values.password.toLowerCase())) {
      await navigate({ to: '/first-sign-in' })
      return
    }
    await navigate({ to: portalFor(roleForEmail(values.email)).to })
  }

  const { isSubmitting } = form.formState

  return (
    <>
      <AuthHeading
        kicker="Sign in"
        title="Welcome back"
        description="Sign in with the email address the school has on file to reach your account."
      />
      <Rule />

      {failed && (
        <AuthAlert
          title="That email and password do not match"
          body="Check the address and try again. After five wrong attempts the account locks for fifteen minutes and the office is notified."
        />
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-[18px]"
        >
          <TextField<SignInValues>
            name="email"
            label="Email address"
            type="email"
            placeholder="you@school.ng"
            hint="The address the school has on file"
            required
          />

          <PasswordInput<SignInValues>
            name="password"
            label="Password"
            placeholder="Your password"
            hint="Six characters or more"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
              <Checkbox
                checked={form.watch('remember')}
                onCheckedChange={(checked) =>
                  form.setValue('remember', checked === true)
                }
              />
              <span>Remember this device for 30 days</span>
            </label>
            <Button asChild variant="ghost" className="px-0 text-brand">
              <Link to="/forgot-password">Forgotten password?</Link>
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full justify-start">
            {isSubmitting && (
              <LoaderCircle
                className="size-[15px] animate-ems-spin"
                strokeWidth={2.4}
              />
            )}
            {isSubmitting ? 'Signing you in…' : 'Sign in'}
          </Button>
        </form>
      </FormProvider>

      <Rule />
      <div className="text-[12.5px] leading-relaxed text-muted-foreground">
        Accounts are created by the school office. If you are new and have no
        password yet, open the invitation email and use the link in it, or ask the
        office to send it again.
      </div>
    </>
  )
}
