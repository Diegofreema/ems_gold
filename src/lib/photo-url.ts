/**
 * Where a person's photograph is read from.
 *
 * The school stores a photo as a bare filename — `passporturl` on a student,
 * `passport` on a teacher, `adminphoto` on an office record — and keeps staff
 * and students in two folders on its own host, which are not alike:
 *
 * - `staff_files/` is public. The picture is an ordinary address, and an
 *   `<img>` needs no forwarding: a picture is not refused across origins the
 *   way a `fetch` is.
 * - `student-files/` is behind the school's own website login — checked
 *   2026-09-27, it answers 302 to `/users/login` — and the portal never holds
 *   that session. The same file comes back from `GET /api/users/download/{name}`
 *   with the portal's token, so a student's photo is fetched that way instead.
 *
 * A row keeps the folder with the filename (`staffPhoto`, `studentPhoto`), so
 * whatever draws it knows which of the two it is looking at.
 *
 * `VITE_PHOTO_BASE` overrides the host for a school served from elsewhere.
 */
export const PHOTO_BASE: string =
  import.meta.env?.VITE_PHOTO_BASE ?? 'https://bronze.uaes.education/'

export const STAFF_FOLDER = 'staff_files'
export const STUDENT_FOLDER = 'student-files'

const isAddress = (value: string) => /^(https?:)?\/\//i.test(value)

function inFolder(folder: string, stored: string | null | undefined): string {
  const name = stored?.trim()
  if (!name) return ''
  // An address the school sends whole is kept whole, so the day it starts
  // doing that nothing here has to change.
  return isAddress(name) ? name : `${folder}/${name.replace(/^\/+/, '')}`
}

/** A teacher's `passport` or an office record's `adminphoto`, as a row keeps it. */
export const staffPhoto = (stored: string | null | undefined) => inFolder(STAFF_FOLDER, stored)

/** A student's `passporturl`, as a row keeps it. */
export const studentPhoto = (stored: string | null | undefined) => inFolder(STUDENT_FOLDER, stored)

/**
 * How to get the picture a row names: an address an `<img>` can load as it
 * stands, or a stored filename to ask the API for with the token. Nothing
 * where there is no photo, so the initials show.
 */
export type PhotoSource = { url: string } | { download: string } | undefined

export function photoSource(stored: string | null | undefined, base: string = PHOTO_BASE): PhotoSource {
  const value = stored?.trim()
  // The dash is what every row writes for "the school sent nothing".
  if (!value || value === '—') return undefined
  if (isAddress(value)) return { url: value }
  const path = value.replace(/^\/+/, '')
  if (path.startsWith(`${STUDENT_FOLDER}/`)) {
    const name = path.slice(STUDENT_FOLDER.length + 1)
    return name ? { download: name } : undefined
  }
  // Each segment escaped rather than the whole, so a space in a filename
  // still loads and the folder keeps its slash.
  const escaped = path.split('/').map((segment) => encodeURIComponent(segment)).join('/')
  return { url: `${base.replace(/\/+$/, '')}/${escaped}` }
}
