import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'
export type Density = 'comfortable' | 'compact'

type UiState = {
  theme: Theme
  density: Density
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDensity: (density: Density) => void
}

/**
 * App-wide client state. Anything that belongs in the URL lives in nuqs
 * instead; anything owned by the server lives in TanStack Query.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      density: 'comfortable',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setDensity: (density) => set({ density }),
    }),
    { name: 'ui-preferences' },
  ),
)
