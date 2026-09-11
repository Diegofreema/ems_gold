import { Link, useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import { useForgotPassword } from '@/api/auth/hooks'
import { Button } from '@/components/ui/button'
import { useRecordForm } from '@/hooks/use-record-form'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import { useAuthStore } from '../auth.store'
import { authButton } from '../components/auth-button'
import { AuthField } from '../components/auth-field'
import { AuthHeading } from '../components/auth-heading'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas'

export function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const forgotPassword = useForgotPassword()
  const startRecovery = useAuthStore((state) => state.startRecovery)

  const form = useRecordForm<ForgotPasswordValues>(forgotPasswordSchema, {
    email: '',
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      // Step 1 hands back the id the next two steps are addressed to.
      const { user_id } = await forgotPassword.mutateAsync({
        username: values.email,
      })
      startRecovery(values.email, user_id)
      await navigate({ to: '/check-email' })
    } catch (error) {
      // Under the field rather than in a banner: every refusal this endpoint
      // gives is about the address that was typed — the school does not know
      // it, or the device could not reach the school to ask.
      form.setError('email', {
        message: errorMessage(error, OFFLINE_MESSAGE),
      })
    }
  }

  const { isSubmitting } = form.formState

  return (
    <>
      <AuthHeading
        title="Forgotten password"
        description="Enter email address to get one time reset code"
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6.5">
          <AuthField<ForgotPasswordValues>
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            icon={Mail}
            autoComplete="username"
          />

          <Button type="submit" pending={isSubmitting} className={`mt-8 ${authButton}`}>
            {isSubmitting ? 'Sending the code…' : 'Send Code'}
          </Button>
        </form>
      </FormProvider>

      <p className="mt-8 text-center text-base">
        Remember Password?{' '}
        <Link to="/sign-in" className="font-semibold text-ui-blue hover:underline">
          Sign In
        </Link>
      </p>
    </>
  )
}
