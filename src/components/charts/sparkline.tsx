import { cn } from '@/lib/utils'

/**
 * A stat card's pulse: one polyline over a real series, drawing itself in.
 *
 * It carries no axes and no figures — the card's own value and delta say the
 * numbers — so it is only ever decoration of data that genuinely exists.
 * Callers must pass a real series; nothing here invents one.
 */
export function Sparkline({
  points,
  className,
}: {
  points: number[]
  className?: string
}) {
  // One point draws nothing worth reading, and an all-zero series is a flat
  // line at the floor — both are drawn honestly rather than skipped.
  if (points.length < 2) return null

  const peak = Math.max(...points, 1)
  const step = 100 / (points.length - 1)
  const path = points
    .map((value, index) =>
      `${index * step},${(34 - (value / peak) * 30).toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      aria-hidden
      className={cn('h-9 w-full overflow-visible', className)}
    >
      <polyline
        points={path}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="animate-ems-draw"
      />
    </svg>
  )
}
