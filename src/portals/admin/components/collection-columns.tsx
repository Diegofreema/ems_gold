import { Tag } from '@/components/common/tag'
import type { Column } from '@/components/data-table/types'
import { toneForStatus } from '@/lib/status-tone'
import type { ColumnSpec, Row } from '../collections/types'

/** Turns a collection's column specs into renderable table columns. */
export function toTableColumns(specs: ColumnSpec[]): Column<Row>[] {
  return specs.map((spec) => ({
    key: spec.key,
    label: spec.label,
    align: spec.align,
    cardRole: spec.cardRole,
    nowrap: !spec.tag,
    cell: (row) =>
      spec.tag ? (
        <Tag variant={toneForStatus(row[spec.key])}>{row[spec.key]}</Tag>
      ) : (
        row[spec.key]
      ),
  }))
}
