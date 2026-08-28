import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/profile-page'
import { adminProfile } from '@/portals/admin/profile'

export const Route = createFileRoute('/admin/profile')({
  staticData: { title: 'My profile', crumb: 'My account' },
  component: () => <ProfilePage config={adminProfile} />,
})
