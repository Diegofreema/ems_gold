import { Link } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '../auth.store'
import { AuthHeading } from '../components/auth-heading'
import { IconSquare } from '../components/icon-square'

export function CheckEmailScreen() {
  const email = useAuthStore((state) => state.email)
  const [resent, setResent] = useState(false)

  return (
    <>
      <IconSquare icon={Mail} />
      <AuthHeading
        title="Check your email"
        description="If an account uses that address, a reset link is on its way. It expires in one hour and can only be used once."
      />
      <div className="mt-[18px] border-2 border-divider px-4 py-3.5 font-heading text-[13px] font-extrabold">
        {email || 'the address on your account'}
      </div>
      <Rule />

      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <Link to="/reset-password">I have the link</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setResent(true)
            toast('Reset link sent again')
          }}
        >
          {resent ? 'Sent again' : 'Send it again'}
        </Button>
      </div>

      <div className="mt-[18px] text-[12.5px] leading-relaxed text-muted-foreground">
        Nothing after a few minutes? Look in spam, then check the address with the
        school office.
      </div>
    </>
  )
}
