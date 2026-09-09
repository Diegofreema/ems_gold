import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ShellState = {
  /** Mobile drawer, only meaningful under the `narrow` breakpoint. */
  drawerOpen: boolean
  /** Sidebar nav groups keyed by heading; absent means collapsed. */
  expandedGroups: Record<string, boolean>
  navQuery: string

  openDrawer: () => void
  closeDrawer: () => void
  toggleGroup: (heading: string) => void
  setNavQuery: (navQuery: string) => void
}

/**
 * Which sidebar sections a person has opened, remembered on the device so a
 * reload keeps their layout. Sections start collapsed, so only the headings
 * they expanded are stored. The drawer and search box are transient and stay
 * out of storage.
 */
export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      drawerOpen: false,
      expandedGroups: {},
      navQuery: '',

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      toggleGroup: (heading) =>
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [heading]: !state.expandedGroups[heading],
          },
        })),

      setNavQuery: (navQuery) => set({ navQuery }),
    }),
    {
      name: 'netpro.shell',
      partialize: (state) => ({ expandedGroups: state.expandedGroups }),
    },
  ),
)
