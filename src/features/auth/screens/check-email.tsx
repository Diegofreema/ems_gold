import { useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useForgotPassword, useVerifyOtp } from '@/api/auth/hooks'
import { Button } from '@/components/ui/button'
import { useRecordForm } from '@/hooks/use-record-form'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import { useAuthStore } from '../auth.store'
import { AuthAlert } from '../components/auth-alert'
import { authButton, authButtonQuiet } from '../components/auth-button'
import { AuthField } from '../components/auth-field'
import { AuthHeading } from '../components/auth-heading'
import { verifyOtpSchema, type VerifyOtpValues } from '../schemas'

/**
 * Step 2 of three. The email carries a six-digit code rather than a link, so
 * the code is typed here and traded for the single-use ticket step 3 needs.
 */
export function CheckEmailScreen() {
  const navigate = useNavigate()
  const email = useAuthStore((state) => state.email)
  const userId = useAuthStore((state) => state.userId)
  const setTicket = useAuthStore((state) => state.setTicket)
  const verifyOtp = useVerifyOtp()
  const forgotPassword = useForgotPassword()
  const [failure, setFailure] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const form = useRecordForm<VerifyOtpValues>(verifyOtpSchema, { otp: '' })

  const onSubmit = async (values: VerifyOtpValues) => {
    if (userId === null) return
    setFailure(null)
    try {
      const { ticket } = await verifyOtp.mutateAsync({
        user_id: userId,
        otp_code: values.otp,
      })
      setTicket(ticket)
      await navigate({ to: '/reset-password' })
    } catch (error) {
      setFailure(errorMessage(error, OFFLINE_MESSAGE))
    }
  }

  const sendAgain = async () => {
    setFailure(null)
    try {
      await forgotPassword.mutateAsync({ username: email })
      setResent(true)
    } catch (error) {
      setFailure(errorMessage(error, OFFLINE_MESSAGE))
    }
  }

  const { isSubmitting } = form.formState

  return (
    <>
      <AuthHeading
        title="Check your email"
        description="If an account uses that address, a six-digit code is on its way. It expires in fifteen minutes and can only be used once."
      />
      <div className="mt-6 flex items-center gap-3 rounded-md bg-auth-field px-4 py-3.5 text-base font-medium">
        <Mail className="size-5 flex-none text-auth-hint" strokeWidth={1.8} />
        {email || 'the address on your account'}
      </div>

      {failure && (
        <AuthAlert
          title={failure}
          body="The code lasts fifteen minutes. Send a new one if it has expired."
        />
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="mt-6.5 flex flex-col gap-5"
        >
          <AuthField<VerifyOtpValues>
            name="otp"
            label="Six-digit code"
            placeholder="123456"
            autoComplete="one-time-code"
          />

          <Button type="submit" pending={isSubmitting} className={`mt-3 ${authButton}`}>
            {isSubmitting ? 'Checking the code…' : 'Continue'}
          </Button>
          <Button
            type="button"
            variant="outline"
            pending={forgotPassword.isPending}
            onClick={sendAgain}
            className={authButtonQuiet}
          >
            {resent ? 'Sent again' : 'Send it again'}
          </Button>
        </form>
      </FormProvider>

      <div className="mt-9 text-[13px] leading-relaxed text-auth-muted">
        Nothing after a few minutes? Look in spam, then check the address with the
        school office.
      </div>
    </>
  )
}
