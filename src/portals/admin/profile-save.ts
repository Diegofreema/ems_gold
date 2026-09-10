import { enqueue } from '@/db/drain'
import { WRITE } from '@/db/ids'
import { profileBody } from '@/features/profile/to-body'
import type { ProfileSave } from '@/features/profile/types'

/**
 * Saving the office record. `PATCH /users/profile` writes to the same row
 * `GET /admins/profile` filled the form from, so the two agree.
 *
 * Queued rather than sent, so a correction made with no connection keeps. The
 * form keeps what was typed — which is what was saved. The sidebar name and
 * the greeting come off the signed-in account, and the handler re-reads the
 * session once the write actually lands — re-reading here would race the
 * queue and fetch the old name back.
 */
export function useAdminProfileSave(): ProfileSave {
  return {
    pending: false,
    save: async (values) => {
      enqueue({
        handler: WRITE.updateAdminProfile,
        payload: profileBody(values),
        toast: { success: 'Your profile was saved' },
        label: 'Your profile',
      })
    },
  }
}
