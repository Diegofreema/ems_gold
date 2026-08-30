import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useLogin } from '@/api/auth/hooks'
import { TextField } from '@/components/form/text-field'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRecordForm } from '@/hooks/use-record-form'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import { useAuthStore } from '../auth.store'
import { AuthAlert } from '../components/auth-alert'
import { AuthHeading } from '../components/auth-heading'
import { PasswordInput } from '../components/password-input'
import { portalFor, roleForAccount } from '../role'
import { loadAccount } from '../session'
import { signInSchema, type SignInValues } from '../schemas'

export function SignInScreen() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const login = useLogin()
  const identify = useAuthStore((state) => state.identify)
  const [failure, setFailure] = useState<string | null>(null)

  const form = useRecordForm<SignInValues>(signInSchema, {
    username: '',
    password: '',
    remember: false,
  })

  const onSubmit = async (values: SignInValues) => {
    setFailure(null)
    try {
      await login.mutateAsync({
        username: values.username,
        password: values.password,
      })

      // The token and the account from the login answer are both stored by
      // now, so this carries the token and is checked against the account.
      // It is still read rather than skipped: `me` is what the portal guard
      // reads on every reload afterwards, and whatever it can be trusted for
      // — a role renamed since, a profile edited — is fresher here.
      const account = await loadAccount(queryClient)
      if (!account) {
        setFailure('Your password was accepted but the account would not load. Try again.')
        return
      }

      const role = roleForAccount(account)
      identify(account.user.username, role)

      await navigate({ to: role ? portalFor(role).to : '/wrong-portal' })
    } catch (error) {
      setFailure(errorMessage(error, OFFLINE_MESSAGE))
    }
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

      {failure && (
        <AuthAlert
          title={failure}
          body="Check the address and try again. After five wrong attempts the account locks for fifteen minutes and the office is notified."
        />
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4.5"
        >
          <TextField<SignInValues>
            name="username"
            label="Email address"
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

          <Button
            type="submit"
            pending={isSubmitting}
            className="w-fit justify-start"
          >
            {isSubmitting ? 'Signing you in…' : 'Sign in'}
          </Button>
        </form>
      </FormProvider>

      <Rule />
      <div className="text-[12.5px] leading-relaxed text-muted-foreground">
        Accounts are created by the school office. If you are new and have no
        password yet, open the invitation email and use the link in it, or ask
        the office to send it again.
      </div>
    </>
  )
}
