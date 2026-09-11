import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Sparkline } from '@/components/charts/sparkline'
import { cn } from '@/lib/utils'

/**
 * The colour a tile's icon square wears. Decorative and nothing else: it is
 * how somebody finds the figure they came for before they have read a word,
 * so what matters is that a given tile keeps the same colour, not what the
 * colour means. Tiles that are given none take them in order.
 */
export type TileAccent =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'violet'
  | 'ink'
  | 'rose'

const ACCENTS: Record<TileAccent, string> = {
  blue: 'bg-tile-blue',
  green: 'bg-tile-green',
  orange: 'bg-tile-orange',
  red: 'bg-tile-red',
  purple: 'bg-tile-purple',
  violet: 'bg-tile-violet',
  ink: 'bg-tile-ink',
  rose: 'bg-tile-rose',
}

const ROTATION: TileAccent[] = [
  'blue',
  'red',
  'orange',
  'green',
  'purple',
  'ink',
  'rose',
  'violet',
]

export type Tile = {
  label: string
  /** A node so a tile can animate its figure — see `CountUp`. */
  value: ReactNode
  /** Optional third line, e.g. "+12% on last term". */
  delta?: string
  /** `up`/`down` colour the delta by direction and draw its arrow;
   *  `alert` is danger without a direction — a figure needing attention. */
  deltaTone?: 'up' | 'down' | 'alert' | 'brand' | 'muted'
  /** Chip drawn at the card's shoulder; where a card's colour lives. */
  icon?: LucideIcon
  /** Which colour that chip wears. Left off, it takes the next in order. */
  accent?: TileAccent
  /** A card that is also a door: it lifts on hover and opens its page. */
  to?: string
  /** A real series to pulse under the figure. Never invented — see Sparkline. */
  spark?: number[]
}

const DELTA_TONE: Record<NonNullable<Tile['deltaTone']>, string> = {
  up: 'text-success-ink',
  down: 'text-danger-ink',
  alert: 'text-danger-ink',
  brand: 'text-brand-700',
  muted: 'text-muted-foreground',
}

/**
 * The stat cards: a label, the figure, a line of context, and a coloured
 * square holding the icon.
 *
 * Flat white on the page's ground rather than bordered and shadowed — the
 * ground is what separates them now, and a border around every card on a page
 * of cards is a grid of lines nobody reads. A card given `to` is a link and
 * says so by lifting.
 *
 * Four across on a wide screen, two on a tablet, one on a phone: the figures
 * are the first thing on most of these pages and must not need scrolling
 * sideways to read.
 */
export function TileStrip({
  tiles,
  size = 'sm',
  className,
}: {
  tiles: Tile[]
  /** `lg` is the dashboard figure size; `sm` is the list-page summary. */
  size?: 'sm' | 'lg'
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid gap-3.5',
        size === 'lg'
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
          : 'grid-cols-[repeat(auto-fit,minmax(210px,1fr))]',
        className,
      )}
    >
      {tiles?.map((tile, index) => {
        const Arrow =
          tile.deltaTone === 'up'
            ? ArrowUpRight
            : tile.deltaTone === 'down'
              ? ArrowDownRight
              : null
        const accent = tile.accent ?? ROTATION[index % ROTATION.length]
        const inside = (
          <>
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  'min-w-0 text-sm text-muted-foreground',
                  size === 'lg' && 'text-[15px]',
                )}
              >
                {tile.label}
              </div>
              {tile.icon && (
                <div
                  className={cn(
                    'grid flex-none place-items-center rounded-[10px] text-white',
                    size === 'lg' ? 'size-10.5' : 'size-9',
                    ACCENTS[accent as TileAccent],
                  )}
                >
                  <tile.icon
                    className={size === 'lg' ? 'size-5' : 'size-4.5'}
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>
            <div
              className={cn(
                'font-heading font-extrabold tabular-nums tracking-[-0.02em]',
                size === 'lg' ? 'mt-2 text-[28px] leading-tight' : 'mt-1.5 text-xl',
              )}
            >
              {tile.value}
            </div>
            {tile.delta && (
              <div
                className={cn(
                  'mt-2 flex items-center gap-1 text-[13px]',
                  DELTA_TONE[tile.deltaTone ?? 'muted'],
                )}
              >
                {Arrow && <Arrow className="size-3.5" strokeWidth={2.4} />}
                {tile.delta}
              </div>
            )}
            {tile.spark && (
              <Sparkline points={tile.spark} className="mt-2.5 text-brand-500" />
            )}
          </>
        )
        const look = cn(
          'block min-w-0 animate-ems-up rounded-xl bg-raised',
          size === 'lg' ? 'p-5' : 'px-4 py-3.5',
          tile.to &&
            'transition hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-hidden',
        )
        const style = { animationDelay: `${index * 40}ms` }

        return tile.to ? (
          <Link
            key={tile.label}
            to={tile.to}
            style={style}
            className={cn(look, '!text-foreground')}
          >
            {inside}
          </Link>
        ) : (
          <div key={tile.label} style={style} className={look}>
            {inside}
          </div>
        )
      })}
    </div>
  )
}
