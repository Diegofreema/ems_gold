import { useState } from 'react'
import { SegmentedControl } from '@/components/common/segmented-control'
import { TableView } from '@/components/data-table/table-view'
import type { DetailTab } from '../collections/detail-tabs'
import { toTableColumns } from './collection-columns'

/** The record's sub-tables, switched by the design's segmented control. */
export function DetailTabPanel({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(0)
  const tab = tabs[active]

  return (
    <section>
      <SegmentedControl
        name="detail-tab"
        className="mb-[18px]"
        value={String(active)}
        onChange={(value) => setActive(Number(value))}
        options={tabs.map((entry, index) => ({
          value: String(index),
          label: entry.label,
        }))}
      />

      <div key={active} className="animate-ems-up overflow-x-auto border-2 border-divider">
        <TableView
          columns={toTableColumns(tab.columns)}
          rows={tab.rows}
          rowKey={(row) => row.id}
        />
      </div>
    </section>
  )
}
