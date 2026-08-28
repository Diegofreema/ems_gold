import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
 * request that follows — and every query a redirect kicks off — already
 * carries it.
 *
 * The login answer is deliberately *not* written into the `me` cache: the two
 * endpoints may describe an account differently, and the app should be reading
 * the one it will still be reading after a reload.
 */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginBody) => authService.login(body),
    onSuccess: (result) => {
      setToken(result.token)
      queryClient.removeQueries({ queryKey: authKeys.me() })
    },
  })
}

/**
 * Shared with the portal route guards, which resolve the account before the
 * shell renders rather than through a hook.
 */
export function meQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    staleTime: 5 * 60_000,
    // A refused token will be refused again, and a portal guard waiting out a
    // retry is a portal that renders nothing for a second longer.
    retry: false,
  })
}

export function useCurrentUser() {
  // Nothing to ask for while signed out.
  return useQuery({ ...meQueryOptions(), enabled: getToken() !== null })
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
