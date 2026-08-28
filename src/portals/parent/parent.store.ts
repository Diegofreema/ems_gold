import { create } from 'zustand'
import { CHILDREN } from './children'

type ParentStore = {
  /** Index into CHILDREN. Most pages are scoped to this child. */
  childIndex: number
  selectChild: (index: number) => void
}

/**
 * The child switcher scopes results, attendance, invoices and tests, so it
 * outlives any one page — app-wide state rather than a per-page filter.
 */
export const useParentStore = create<ParentStore>((set) => ({
  childIndex: 0,
  selectChild: (index) =>
    set({ childIndex: Math.min(Math.max(0, index), CHILDREN.length - 1) }),
}))

export function useSelectedChild() {
  const index = useParentStore((state) => state.childIndex)
  return CHILDREN[index]
}
