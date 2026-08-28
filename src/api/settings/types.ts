/** The one settings row, grouped as the API returns it. */
export type SchoolSettings = {
  /** Scalar fields — name, address, rector, regno format and so on. */
  prefixes?: Record<string, unknown>
  /** Crest and stamp, with ready-made URLs. */
  images?: Record<string, string>
  calendar?: Record<string, unknown>
  [key: string]: unknown
}

/** The sessions and terms the calendar pickers offer. */
export type SettingsOptions = Record<string, unknown>

/**
 * Dates accept YYYY-MM-DD or DD/MM/YYYY and are stored as DD/MM/YYYY. The
 * crest and stamp are files and can only be changed through the web form.
 */
export type SettingsBody = {
  name?: string
  phone?: string
  email?: string
  address?: string
  rector?: string
  rectorcerts?: string
  registrar?: string
  registrarcerts?: string
  currenttermends?: string
  nexttermbegins?: string
  regnoformat?: string
  application_no_prefix?: string
  session_id?: number
}
