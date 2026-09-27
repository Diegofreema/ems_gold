import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Student } from '../../../api/students/types.ts'
import type { Teacher } from '../../../api/teachers/types.ts'
import type { Admin } from '../../../api/users/types.ts'
import { PHOTO_KEY } from '../../../features/collections/photo-key.ts'
import { initialsOfName } from '../../../features/profile/record.ts'
import { adminRow, teacherRow } from './staff-row.ts'
import { studentRow } from './student-row.ts'

/*
 * Each kind of person keeps the photo under its own name — read off bronze
 * 2026-09-27 — and every row hands it on under the one key the record page
 * reads, with the folder the school keeps it in. A reader that took the
 * wrong field would draw initials for everybody and look exactly like a
 * school with no photos, so each is pinned here.
 */

test('a student’s photo is `passporturl`', () => {
  const row = studentRow({ id: 213, fname: 'Chinua', lname: 'Aniegboka', passporturl: '6aa912ae8ead21789465262.png' } as unknown as Student)
  assert.equal(row[PHOTO_KEY], 'student-files/6aa912ae8ead21789465262.png')
})

test('a teacher’s photo is `passport`, and an empty one is no photo', () => {
  const teacher = { id: 7, firstname: 'Ada', lastname: 'Obi', passport: '27_08_26_09_48_596a90080b0c39b3.92078397.png' }
  assert.equal(teacherRow(teacher as unknown as Teacher)[PHOTO_KEY], 'staff_files/27_08_26_09_48_596a90080b0c39b3.92078397.png')
  // Bronze sends "" for a teacher with none, as well as null.
  assert.equal(teacherRow({ ...teacher, passport: '' } as unknown as Teacher)[PHOTO_KEY], '')
  assert.equal(teacherRow({ ...teacher, passport: null } as unknown as Teacher)[PHOTO_KEY], '')
})

test('an office record’s photo is `adminphoto`', () => {
  const admin = { id: 1, surname: 'Surname', lastname: 'Firstname', adminphoto: '11_08_21_12_41_216113c571c70f6_IMG_2159.jpg' }
  assert.equal(adminRow(admin as unknown as Admin)[PHOTO_KEY], 'staff_files/11_08_21_12_41_216113c571c70f6_IMG_2159.jpg')
})

test('initials come off the first and last words of a written name', () => {
  assert.equal(initialsOfName('Chidi Ebuka Okafor'), 'CO')
  assert.equal(initialsOfName('udezue ezigbo ugboaja'), 'UU')
  assert.equal(initialsOfName('Adaeze'), 'A')
  // The dash a row writes for a missing name is no name, not a letter.
  assert.equal(initialsOfName('—'), '··')
  assert.equal(initialsOfName(''), '··')
})
