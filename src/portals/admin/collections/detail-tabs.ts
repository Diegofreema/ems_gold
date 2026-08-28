import type { ColumnSpec, Row } from './types'

export type DetailTab = {
  label: string
  columns: ColumnSpec[]
  rows: Row[]
}

const ACTIVITY: DetailTab = {
  label: 'Activity',
  columns: [
    { key: 'when', label: 'When' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
  ],
  rows: [
    { id: 'ac-1', when: '09:42 today', user: 'A. Okonkwo', action: 'Opened this record' },
    { id: 'ac-2', when: 'Yesterday 17:20', user: 'A. Okonkwo', action: 'Edited this record' },
  ],
}

/** Per-collection sub-tables shown on a record. Anything unlisted gets Activity. */
const TABS: Record<string, DetailTab[]> = {
  students: [
    {
      label: 'Fees',
      columns: [{ key: 'invoice', label: 'Invoice' }, { key: 'fee', label: 'Fee' }, { key: 'amount', label: 'Amount', align: 'right' }, { key: 'state', label: 'State', tag: true }],
      rows: [
        { id: 'sf-1', invoice: 'INV-25133', fee: 'Tuition — SS', amount: '₦120,000', state: 'Unpaid' },
        { id: 'sf-2', invoice: 'INV-25074', fee: 'ICT levy', amount: '₦15,000', state: 'Paid' },
        { id: 'sf-3', invoice: 'INV-24980', fee: 'Boarding', amount: '₦85,000', state: 'Paid' },
      ],
    },
    {
      label: 'Results',
      columns: [{ key: 'subject', label: 'Subject' }, { key: 'total', label: 'Total', align: 'right' }, { key: 'grade', label: 'Grade', tag: true }],
      rows: [
        { id: 'sr-1', subject: 'Mathematics', total: '78', grade: 'A' },
        { id: 'sr-2', subject: 'English Language', total: '72', grade: 'B' },
        { id: 'sr-3', subject: 'Biology', total: '71', grade: 'B' },
      ],
    },
    {
      label: 'Attendance',
      columns: [{ key: 'date', label: 'Date' }, { key: 'state', label: 'Mark', tag: true }, { key: 'note', label: 'Note' }],
      rows: [
        { id: 'sa-1', date: '19 Nov', state: 'Present', note: '—' },
        { id: 'sa-2', date: '18 Nov', state: 'Present', note: '—' },
        { id: 'sa-3', date: '15 Nov', state: 'Absent', note: 'Unexcused' },
      ],
    },
  ],
  invoices: [
    {
      label: 'Payments',
      columns: [{ key: 'receipt', label: 'Receipt' }, { key: 'amount', label: 'Amount', align: 'right' }, { key: 'method', label: 'Method' }, { key: 'date', label: 'Date' }],
      rows: [
        { id: 'ip-1', receipt: 'RCT-8841', amount: '₦60,000', method: 'Transfer', date: '02 Oct 2025' },
        { id: 'ip-2', receipt: 'RCT-8790', amount: '₦60,000', method: 'Remita', date: '18 Oct 2025' },
      ],
    },
    {
      label: 'Reminders',
      columns: [{ key: 'when', label: 'Sent' }, { key: 'channel', label: 'Channel' }, { key: 'to', label: 'To' }],
      rows: [
        { id: 'ir-1', when: '12 Nov', channel: 'Email', to: 'Mr. Emmanuel Udo' },
        { id: 'ir-2', when: '05 Nov', channel: 'SMS', to: '0803 441 2280' },
      ],
    },
  ],
  staff: [
    {
      label: 'Subjects',
      columns: [{ key: 'subject', label: 'Subject' }, { key: 'arm', label: 'Arm' }, { key: 'pupils', label: 'Pupils', align: 'right' }],
      rows: [
        { id: 'ss-1', subject: 'Mathematics', arm: 'SS1 A', pupils: '35' },
        { id: 'ss-2', subject: 'Mathematics', arm: 'SS2 A', pupils: '36' },
        { id: 'ss-3', subject: 'Further Maths', arm: 'SS2 A', pupils: '18' },
      ],
    },
    {
      label: 'Uploads',
      columns: [{ key: 'batch', label: 'Batch' }, { key: 'subject', label: 'Subject' }, { key: 'state', label: 'State', tag: true }],
      rows: [
        { id: 'su-1', batch: 'BAT-1142', subject: 'Mathematics', state: 'Approved' },
        { id: 'su-2', batch: 'BAT-1121', subject: 'Further Maths', state: 'Rejected' },
      ],
    },
  ],
  fees: [
    {
      label: 'Allocations',
      columns: [{ key: 'arm', label: 'Arm' }, { key: 'pupils', label: 'Pupils', align: 'right' }, { key: 'billed', label: 'Billed', align: 'right' }],
      rows: [
        { id: 'fa-1', arm: 'SS1 A', pupils: '35', billed: '₦4,200,000' },
        { id: 'fa-2', arm: 'SS2 B', pupils: '34', billed: '₦4,080,000' },
        { id: 'fa-3', arm: 'SS3 A', pupils: '31', billed: '₦3,720,000' },
      ],
    },
    {
      label: 'Invoices',
      columns: [{ key: 'invoice', label: 'Invoice' }, { key: 'student', label: 'Pupil' }, { key: 'state', label: 'State', tag: true }],
      rows: [
        { id: 'fi-1', invoice: 'INV-25133', student: 'Ngozi Eze', state: 'Unpaid' },
        { id: 'fi-2', invoice: 'INV-25084', student: 'Segun Bakare', state: 'Paid' },
      ],
    },
  ],
  parents: [
    {
      label: 'Children',
      columns: [{ key: 'name', label: 'Child' }, { key: 'arm', label: 'Arm' }, { key: 'owing', label: 'Owing', align: 'right' }],
      rows: [
        { id: 'pc-1', name: 'Chinedu Udo', arm: 'SS2 B', owing: '₦85,000' },
        { id: 'pc-2', name: 'Amaka Udo', arm: 'Primary 5 A', owing: '₦32,000' },
      ],
    },
    {
      label: 'Payments',
      columns: [{ key: 'receipt', label: 'Receipt' }, { key: 'amount', label: 'Amount', align: 'right' }, { key: 'date', label: 'Date' }],
      rows: [
        { id: 'pp-1', receipt: 'RCT-8841', amount: '₦120,000', date: '02 Oct 2025' },
        { id: 'pp-2', receipt: 'RCT-8744', amount: '₦15,000', date: '19 Sep 2025' },
      ],
    },
  ],
}

/** Slices share their base collection's tabs — `staff-admin` reads as `staff`. */
export function detailTabsFor(collectionId: string): DetailTab[] {
  const base = collectionId.split('-')[0]
  return TABS[collectionId] ?? TABS[base] ?? [ACTIVITY]
}
