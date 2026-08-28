import { useState } from 'react'
import { SectionHeading } from '@/components/common/section-heading'
import { SegmentedControl } from '@/components/common/segmented-control'
import { TableView } from '@/components/data-table/table-view'
import type { DetailTab } from '../types'
import { toTableColumns } from './collection-columns'

/**
 * The record's sub-tables. More than one becomes the design's segmented
 * control; a single tab is just a titled table.
 */
export function DetailTabPanel({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(0)
  const tab = tabs[active]

  return (
    <section>
      {tabs.length > 1 ? (
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
      ) : (
        <SectionHeading className="mb-3.5">{tab.label}</SectionHeading>
      )}

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
