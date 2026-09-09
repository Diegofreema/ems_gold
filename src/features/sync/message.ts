export type SyncCopy = {
  online: boolean
  /** Whether work written now survives a reload. */
  durable: boolean
  /** Written down, not yet sent. */
  waiting: number
  /** Refused, or in flight when the tab died. Needs a person. */
  needsAnswer: number
}

const count = (amount: number, one: string, many: string) =>
  `${amount} ${amount === 1 ? one : many}`

/**
 * What the bar under the header says.
 *
 * Pure, and tested, because this is the app's one promise about somebody's
 * work and it has been broken before: the bar used to tell every reader that
 * what they typed would send when the connection returned, at a time when
 * nothing was keeping it. Each sentence here has to be true in the state that
 * produces it — including the unhappy one, where the browser will not store
 * anything and the person is about to close the tab.
 */
export function syncMessage({ online, durable, waiting, needsAnswer }: SyncCopy): string {
  if (needsAnswer > 0) {
    return `${count(needsAnswer, 'change needs', 'changes need')} your attention before ${
      needsAnswer === 1 ? 'it can' : 'they can'
    } be saved to the school.`
  }

  if (!online && !durable) {
    return waiting > 0
      ? `You are offline, and this browser cannot save work between visits. Keep this tab open — ${count(
          waiting,
          'change is',
          'changes are',
        )} waiting to send.`
      : 'You are offline, and this browser cannot save work between visits. Anything you type will be lost if you close this tab.'
  }

  if (!online) {
    return waiting > 0
      ? `You are offline. ${count(
          waiting,
          'change is',
          'changes are',
        )} saved on this device and will send when the connection returns.`
      : 'You are offline. Your work is saved on this device and will send when the connection returns.'
  }

  return `${count(waiting, 'change is', 'changes are')} still being sent to the school.`
}
