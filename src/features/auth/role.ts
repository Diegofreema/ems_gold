export type Role = 'Admin' | 'Teacher' | 'Student' | 'Parent'

export type Portal = {
  role: Role
  label: string
  hint: string
  to: string
}

export const PORTALS: Portal[] = [
  { role: 'Admin', label: 'Admin portal', hint: 'Office and bursary', to: '/admin' },
  { role: 'Teacher', label: 'Teacher portal', hint: 'Scores and registers', to: '/teacher' },
  { role: 'Student', label: 'Student portal', hint: 'Results and materials', to: '/student' },
  { role: 'Parent', label: 'Parent portal', hint: 'Fees and progress', to: '/parent' },
]

/**
 * The account decides the portal, not the person signing in. This mirrors the
 * prototype's demo rule and is the seam to replace with the real claim from
 * the sign-in response.
 */
export function roleForEmail(email: string): Role {
  const value = email.trim().toLowerCase()
  if (/^(admin|office|bursary|head)[.@]/.test(value)) return 'Admin'
  if (/^(parent|guardian)[.@]/.test(value)) return 'Parent'
  if (/^(pupil|student)[.@]/.test(value) || /@pupils\./.test(value)) return 'Student'
  return 'Teacher'
}

export function portalFor(role: Role): Portal {
  return PORTALS.find((portal) => portal.role === role) ?? PORTALS[1]
}
