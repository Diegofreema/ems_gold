import {
  loadCollection as load,
  loadRecord as loadOne,
  loadRecordForEdit as loadOneForEdit,
} from '@/features/collections/resolve'
import { adminCollections } from './index'

export const loadCollection = (id: string) => load(adminCollections, id)

export const loadRecord = (id: string, recordId: string) =>
  loadOne(adminCollections, id, recordId)

export const loadRecordForEdit = (id: string, recordId: string) =>
  loadOneForEdit(adminCollections, id, recordId)
