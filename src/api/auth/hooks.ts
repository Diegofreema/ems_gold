import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getToken, setToken } from '../token'
import { authKeys } from './keys'
import { authService } from './service'
import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  ResetPasswordBody,
  VerifyOtpBody,
} from './types'

/**
 * Signing in stores the bearer token before anything else runs, so the `me`
 * refetch below — and every query a redirect kicks off — already carries it.
 */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginBody) => authService.login(body),
    onSuccess: (result) => {
      setToken(result.token)
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    // Nothing to ask for while signed out.
    enabled: getToken() !== null,
    staleTime: 5 * 60_000,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (everywhere?: boolean) =>
      everywhere ? authService.logoutEverywhere() : authService.logout(),
    // Drops the token and the cache whether or not the server agreed — a
    // refused logout must still end the session on this device.
    onSettled: () => {
      setToken(null)
      queryClient.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (body: ForgotPasswordBody) => authService.forgotPassword(body) })
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: (body: VerifyOtpBody) => authService.verifyOtp(body) })
}

export function useResetPassword() {
  return useMutation({ mutationFn: (body: ResetPasswordBody) => authService.resetPassword(body) })
}

export function useChangePassword() {
  return useMutation({ mutationFn: (body: ChangePasswordBody) => authService.changePassword(body) })
}
