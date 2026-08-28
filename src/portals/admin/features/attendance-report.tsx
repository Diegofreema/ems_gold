import { Download } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Tag } from '@/components/common/tag'
import { DataTable } from '@/components/data-table/data-table'
import type { Column } from '@/components/data-table/types'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { rateFor, standingFor } from './attendance'

type Pupil = {
  id: string
  name: string
  arm: string
  open: number
  present: number
}

const PUPILS: Pupil[] = [
  { id: 'r-1', name: 'Ngozi Eze', arm: 'SS1 A', open: 46, present: 45 },
  { id: 'r-2', name: 'Chinedu Udo', arm: 'SS2 B', open: 46, present: 41 },
  { id: 'r-3', name: 'Fatima Bello', arm: 'JSS1 A', open: 46, present: 44 },
  { id: 'r-4', name: 'Tolu Adeyemi', arm: 'Primary 4 A', open: 46, present: 39 },
  { id: 'r-5', name: 'David Ogunleye', arm: 'SS3 A', open: 46, present: 46 },
  { id: 'r-6', name: 'Amarachi Nwosu', arm: 'Primary 6 B', open: 46, present: 43 },
  { id: 'r-7', name: 'Ibrahim Sani', arm: 'JSS3 C', open: 46, present: 33 },
  { id: 'r-8', name: 'Blessing Okoro', arm: 'Primary 2 A', open: 46, present: 45 },
]

const ARMS = ['All classes', 'Primary 2 A', 'Primary 4 A', 'Primary 6 B', 'JSS1 A', 'JSS3 C', 'SS1 A', 'SS2 B', 'SS3 A']
const RANGES = ['This term', 'Last 30 days', 'This session']

const COLUMNS: Column<Pupil>[] = [
  { key: 'name', label: 'Pupil', cardRole: 'title', cell: (row) => row.name },
  { key: 'arm', label: 'Arm', cardRole: 'subtitle', cell: (row) => row.arm },
  { key: 'open', label: 'Days open', align: 'right', cell: (row) => row.open },
  { key: 'present', label: 'Present', align: 'right', cell: (row) => row.present },
  { key: 'absent', label: 'Absent', align: 'right', cell: (row) => row.open - row.present },
  { key: 'rate', label: 'Rate', align: 'right', cell: (row) => `${rateFor(row)}%` },
  {
    key: 'standing',
    label: 'Standing',
    cardRole: 'tag',
    cell: (row) => {
      const standing = standingFor(rateFor(row))
      return (
        <Tag variant={standing === 'Good' ? 'neutral' : standing === 'Poor' ? 'accent' : 'outline'}>
          {standing}
        </Tag>
      )
    },
  },
]

export function AttendanceReport() {
  const [arm, setArm] = useQueryState('arm', parseAsString.withDefault('All classes'))
  const [range, setRange] = useQueryState('range', parseAsString.withDefault('This term'))

  const rows = useMemo(
    () => (arm === 'All classes' ? PUPILS : PUPILS.filter((pupil) => pupil.arm === arm)),
    [arm],
  )

  const summary = useMemo(() => {
    const open = rows.reduce((total, pupil) => total + pupil.open, 0)
    const present = rows.reduce((total, pupil) => total + pupil.present, 0)
    const poor = rows.filter((pupil) => standingFor(rateFor(pupil)) === 'Poor').length
    return [
      { label: 'Pupils in range', value: String(rows.length) },
      { label: 'Average rate', value: open ? `${Math.round((present / open) * 100)}%` : '—' },
      { label: 'Days absent', value: String(open - present) },
      { label: 'Below 85%', value: String(poor) },
    ]
  }, [rows])

  return (
    <div>
      <PageHeader
        kicker="People"
        title="Attendance report"
        description="Attendance over a date range, by pupil. Use this for the termly report to parents."
        action={
          <Button onClick={() => toast('Report exported')}>
            <Download className="size-[15px]" strokeWidth={2} />
            Export CSV
          </Button>
        }
      />
      <Rule />

      <div className="mb-[22px] grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
        <div>
          <Label htmlFor="range" className="mb-[5px] block text-xs font-normal text-foreground/70">
            Date range
          </Label>
          <Select value={range} onValueChange={(value) => void setRange(value)}>
            <SelectTrigger id="range" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="arm" className="mb-[5px] block text-xs font-normal text-foreground/70">
            Class arm
          </Label>
          <Select value={arm} onValueChange={(value) => void setArm(value)}>
            <SelectTrigger id="arm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARMS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TileStrip className="mb-[22px]" tiles={summary} />

      <DataTable columns={COLUMNS} rows={rows} rowKey={(row) => row.id} />
    </div>
  )
}
