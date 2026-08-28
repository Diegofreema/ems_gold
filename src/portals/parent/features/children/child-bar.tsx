import { useLocation } from '@tanstack/react-router'
import { CHILDREN } from '../../children'
import { useParentStore } from '../../parent.store'
import { cn } from '@/lib/utils'

/** Pages that already cover the whole family, so the switcher would mislead. */
const FAMILY_WIDE = ['/parent/children', '/parent/receipts', '/parent/pay']

/** Scopes results, attendance, invoices and tests to one child. */
export function ChildBar() {
  const { pathname } = useLocation()
  const childIndex = useParentStore((state) => state.childIndex)
  const selectChild = useParentStore((state) => state.selectChild)

  if (FAMILY_WIDE.some((path) => pathname.startsWith(path))) return null

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-divider bg-neutral-100 px-6 py-3">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Viewing
      </div>
      <div className="flex flex-wrap gap-2">
        {CHILDREN.map((child, index) => (
          <button
            key={child.adm}
            type="button"
            aria-pressed={index === childIndex}
            onClick={() => selectChild(index)}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 border-2 px-3.5 py-[7px] text-[13px] transition-colors hover:border-foreground',
              index === childIndex
                ? 'border-brand bg-brand/10'
                : 'border-divider bg-background',
            )}
          >
            <span className="font-heading font-extrabold">{child.name}</span>
            <span className="opacity-70">{child.arm}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
