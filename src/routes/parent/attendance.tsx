import { createFileRoute } from '@tanstack/react-router'
import { attendanceFor } from '@/portals/parent/collections'
import { CollectionPage } from '@/portals/parent/components/collection-page'
import { useSelectedChild } from '@/portals/parent/parent.store'

export const Route = createFileRoute('/parent/attendance')({
  staticData: { title: 'Attendance', crumb: 'My children' },
  component: AttendanceList,
})

function AttendanceList() {
  return <CollectionPage definition={attendanceFor(useSelectedChild())} />
}
