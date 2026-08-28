import { cn } from '@/lib/utils'

/** An accent `h6` followed by a 1px rule — the design's section divider. */
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-baseline gap-2.5', className)}>
      <h6 className="text-[13px] uppercase tracking-[0.08em] text-brand-700">
        {children}
      </h6>
      <div className="h-px flex-1 bg-divider" />
    </div>
  )
}
