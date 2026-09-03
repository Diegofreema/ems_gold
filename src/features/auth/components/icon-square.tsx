import type { LucideIcon } from 'lucide-react'

/** The 40px accent square that opens the outcome screens. */
export function IconSquare({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="grid size-10 place-items-center rounded-lg bg-brand text-white">
      <Icon className="size-5.5" strokeWidth={2.2} />
    </div>
  )
}
