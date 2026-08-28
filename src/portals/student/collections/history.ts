import type { DetailTab } from '@/features/collections/types'

/** Pupils see a record's history rather than an editable activity log. */
export const historyTab: DetailTab[] = [
  {
    label: 'History',
    columns: [
      { key: 'what', label: 'What happened' },
      { key: 'when', label: 'When' },
    ],
    rows: [
      { id: 'h-1', what: 'Opened by you', when: 'Today, 07:58' },
      { id: 'h-2', what: 'Shared by your teacher', when: '18 Nov 2025, 16:20' },
      { id: 'h-3', what: 'Approved by the school office', when: '15 Nov 2025, 11:05' },
    ],
  },
]
