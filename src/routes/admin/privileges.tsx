import { createFileRoute } from '@tanstack/react-router'
import { PrivilegesMatrix } from '@/portals/admin/features/privileges-matrix'

export const Route = createFileRoute('/admin/privileges')({
  staticData: { title: 'Roles & privileges', crumb: 'School' },
  component: PrivilegesMatrix,
})
