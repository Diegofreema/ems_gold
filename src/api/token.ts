const STORAGE_KEY = 'netpro.token'

/**
 * The bearer token lives here rather than in a store, because the fetch client
 * needs it outside React and the auth hooks need to set it from inside. Kept in
 * a module variable so a request never touches localStorage, and mirrored to
 * localStorage so a reload stays signed in.
 */
let token: string | null = null

export function getToken(): string | null {
  if (token === null) token = readStored()
  return token
}

export function setToken(next: string | null): void {
  token = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, next)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ponytail: private-mode localStorage throws; the in-memory token still
    // carries the session until the tab closes.
  }
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
