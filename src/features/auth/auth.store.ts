import { create } from 'zustand'
import { type Role, roleForEmail } from './role'

type AuthState = {
  /** Carried between screens; deliberately not put in the URL. */
  email: string
  role: Role
  /** Drives the wording on the final screen. */
  passwordChanged: boolean

  identify: (email: string) => void
  setPasswordChanged: (passwordChanged: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  email: '',
  role: 'Teacher',
  passwordChanged: false,

  identify: (email) => set({ email, role: roleForEmail(email) }),
  setPasswordChanged: (passwordChanged) => set({ passwordChanged }),
  reset: () => set({ email: '', role: 'Teacher', passwordChanged: false }),
}))
