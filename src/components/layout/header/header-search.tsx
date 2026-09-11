import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'

/**
 * The box in the header, on the portal that has something for it to search.
 *
 * It hands the words to the school's own search rather than filtering the
 * rail, which is what the box in the sidebar used to do: somebody typing a
 * surname into a search box at the top of an office screen is looking for a
 * person, not for a menu item. Only the admin portal declares a `searchPath` —
 * the API gives a teacher, a guardian or a student nothing to search across.
 */
export function HeaderSearch({ to }: { to: string }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const q = term.trim()
        if (!q) return
        void navigate({ to, search: { q } })
      }}
      className="relative hidden min-w-0 flex-1 md:block md:max-w-96"
    >
      <Search
        className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4.5 text-ui-hint"
        strokeWidth={1.9}
        aria-hidden="true"
      />
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search for anything"
        aria-label="Search the school's registers"
        className="h-10 w-full rounded-lg border border-transparent bg-ui-field pr-4 pl-11 text-[15px] transition-colors outline-none placeholder:text-ui-hint focus-visible:border-brand"
      />
    </form>
  )
}
