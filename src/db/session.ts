import { openFor } from './bootstrap'
import { resumeAfterSignIn, startDrain } from './drain'
import { runtime } from './runtime'
import { removeForeignDatabases, wipeLocalDb } from './wipe'

/**
 * Hands this device to an account.
 *
 * Called on every sign-in, because the account signing in is not always the
 * account the device last held: a sign-out that never finished, a shared staff
 * room laptop, a second person on the same browser. Whenever it is somebody
 * new, the previous database goes before anything is allowed to sync into it.
 *
 * Belt to `endSession`'s braces. Either one alone would be a hole.
 */
export async function adoptDevice(ownerId: string): Promise<void> {
  if (runtime.ownerId !== null && runtime.ownerId !== ownerId) {
    await wipeLocalDb()
  }

  // And anything an interrupted sign-out left behind under somebody else's
  // name, which no later wipe would ever go looking for.
  await removeForeignDatabases(ownerId)

  await openFor(ownerId)

  // A queue that stopped because the last token was refused can go again.
  resumeAfterSignIn()
  await startDrain()
}
