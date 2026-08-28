import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useLogout } from '@/api/auth/hooks'
import { SectionHeading } from '@/components/common/section-heading'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { DetailRows } from '@/features/auth/components/detail-rows'
import { AppearancePicker } from './components/appearance-picker'
import { ChangePassword } from './components/change-password'
import { ContactPrefs } from './components/contact-prefs'
import {
  PersonalDetails,
  type ProfileValues,
} from './components/personal-details'
import { ProfileIdentity } from './components/profile-identity'
import { useRecordForm } from '@/hooks/use-record-form'
import { profileSchema } from './schema'
import type { ProfileConfig } from './types'

/**
 * The account page, shared by all four portals. The form lives here rather than
 * in `PersonalDetails` so the heading can show the name as it is being typed.
 */
export function ProfilePage({ config }: { config: ProfileConfig }) {
  const navigate = useNavigate()
  const logout = useLogout()
  const form = useRecordForm<ProfileValues>(
    profileSchema(config.fields),
    config.values,
  )
  const edited = form.watch('fullname')
  const name =
    typeof edited === 'string' && edited ? edited : config.values.fullname

  return (
    <div className="max-w-[940px]">
      <ProfileIdentity
        initials={config.initials}
        name={name}
        meta={config.meta}
      />
      <Rule />

      <div className="grid items-start gap-[34px] lg:grid-cols-[1.4fr_1fr]">
        <section>
          <PersonalDetails
            form={form}
            note={config.note}
            fields={config.fields}
            values={config.values}
          />
          <ChangePassword />
        </section>

        <aside>
          <SectionHeading className="mb-3.5">Sign-in</SectionHeading>
          <DetailRows rows={config.account} className="mt-0" />

          <SectionHeading className="mt-7 mb-3.5">
            How the school reaches you
          </SectionHeading>
          <ContactPrefs prefs={config.prefs} />

          <SectionHeading className="mt-7 mb-3.5">Appearance</SectionHeading>
          <AppearancePicker />

          <SectionHeading className="mt-7 mb-3.5">Session</SectionHeading>
          {/* The API revokes every token for the account at once, this one
              included, so the page it lands on has to be sign-in. */}
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={logout.isPending}
            onClick={async () => {
              await logout.mutateAsync(true).catch(() => undefined)
              toast('Signed out of every device — sign in again')
              await navigate({ to: '/sign-in' })
            }}
          >
            Sign out my other devices
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {config.sessionNote}
          </p>
        </aside>
      </div>
    </div>
  )
}
