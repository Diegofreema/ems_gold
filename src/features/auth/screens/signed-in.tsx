import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '../auth.store'
import { AuthHeading } from '../components/auth-heading'
import { IconSquare } from '../components/icon-square'
import { PORTALS, portalFor } from '../role'

export function SignedInScreen() {
  const role = useAuthStore((state) => state.role)
  const passwordChanged = useAuthStore((state) => state.passwordChanged)
  const portal = portalFor(role)

  return (
    <>
      <IconSquare icon={Check} />
      <AuthHeading
        title={passwordChanged ? 'Password saved' : 'You are signed in'}
        description={
          passwordChanged
            ? 'Use the new password from now on. Other devices have been signed out.'
            : 'Take me to the part of the system this account belongs to.'
        }
      />
      <Rule />

      <Button asChild>
        <Link to={portal.to}>Open the {role.toLowerCase()} portal</Link>
      </Button>

      <div className="mt-[22px] flex flex-wrap gap-4 text-xs">
        {PORTALS.map((entry) => (
          <Link key={entry.to} to={entry.to}>
            {entry.label}
          </Link>
        ))}
      </div>
    </>
  )
}
