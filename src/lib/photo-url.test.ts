import assert from 'node:assert/strict'
import { test } from 'node:test'
import { photoSource, staffPhoto, studentPhoto } from './photo-url.ts'

const BASE = 'https://bronze.uaes.education/'

test('a staff photo is a public address in staff_files', () => {
  // The address the school gave, 2026-09-27, which answers 200 image/png.
  assert.deepEqual(photoSource(staffPhoto('27_09_26_12_15_266ab8face1d49d0.66381379.png'), BASE), {
    url: 'https://bronze.uaes.education/staff_files/27_09_26_12_15_266ab8face1d49d0.66381379.png',
  })
})

test('a student photo is fetched with the token, by its bare filename', () => {
  // `student-files/` itself redirects to the website's login, so it is never
  // handed to an <img>; the API's download endpoint serves the same file.
  assert.equal(studentPhoto('6aa912ae8ead21789465262.png'), 'student-files/6aa912ae8ead21789465262.png')
  assert.deepEqual(photoSource(studentPhoto('6aa912ae8ead21789465262.png'), BASE), {
    download: '6aa912ae8ead21789465262.png',
  })
})

test('no photo is no source, so the initials show', () => {
  for (const nothing of [null, undefined, '', '   ']) {
    assert.equal(staffPhoto(nothing), '')
    assert.equal(studentPhoto(nothing), '')
  }
  for (const nothing of [null, undefined, '', '—', 'student-files/']) assert.equal(photoSource(nothing, BASE), undefined)
})

test('an address the school sends whole is left alone', () => {
  assert.equal(staffPhoto('https://cdn.example.com/p/1.png'), 'https://cdn.example.com/p/1.png')
  assert.deepEqual(photoSource('https://cdn.example.com/p/1.png', BASE), { url: 'https://cdn.example.com/p/1.png' })
})

test('the joins are clean either side, and a name is escaped by its parts', () => {
  assert.deepEqual(photoSource(staffPhoto('/my photo.jpg'), 'https://school.test///'), {
    url: 'https://school.test/staff_files/my%20photo.jpg',
  })
})
