import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useUpdateMyProfile } from '@/api/users/hooks'
import { refreshAccount } from '@/features/auth/session'
import { profileBody } from '@/features/profile/to-body'
import type { ProfileSave } from '@/features/profile/types'

/**
 * Saving the office record. `PATCH /users/profile` writes to the same row
 * `GET /admins/profile` filled the form from, so the two agree.
 */
export function useAdminProfileSave(): ProfileSave {
  const queryClient = useQueryClient()
  const router = useRouter()
  const save = useUpdateMyProfile()

  return {
    pending: save.isPending,
    save: async (values) => {
      // A refusal has already been announced by the mutation cache; swallowing
      // it here only keeps it out of the submit handler.
      const saved = await save.mutateAsync(profileBody(values)).then(
        () => true,
        () => false,
      )
      if (!saved) return
      // The name is on the sidebar and in the greeting too, so the session has
      // to be re-read before either can go stale.
      await refreshAccount(queryClient).catch(() => undefined)
      // And the page itself is filled by the route's loader off
      // `GET /admins/profile`, which no invalidation reaches — without this it
      // goes on showing the job title that was just replaced.
      await router.invalidate()
    },
  }
}
