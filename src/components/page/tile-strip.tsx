import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/charts/sparkline';
import { cn } from '@/lib/utils';

export type Tile = {
  label: string;
  /** A node so a tile can animate its figure — see `CountUp`. */
  value: ReactNode;
  /** Optional third line, e.g. "+12% on last term". */
  delta?: string;
  /** `up`/`down` colour the delta by direction and draw its arrow;
   *  `alert` is danger without a direction — a figure needing attention. */
  deltaTone?: 'up' | 'down' | 'alert' | 'brand' | 'muted';
  /** Chip drawn beside the label; where most of a card's colour lives. */
  icon?: LucideIcon;
  /** A card that is also a door: it lifts on hover and opens its page. */
  to?: string;
  /** A real series to pulse under the figure. Never invented — see Sparkline. */
  spark?: number[];
};

const DELTA_TONE: Record<NonNullable<Tile['deltaTone']>, string> = {
  up: 'text-success-ink',
  down: 'text-danger-ink',
  alert: 'text-danger-ink',
  brand: 'text-brand-700',
  muted: 'text-muted-foreground',
};

/**
 * The stat cards. One rounded card per figure, gapped rather than fused —
 * the shared 2px slab this used to be was the first thing retired when the
 * design went soft. A card given `to` is a link and says so by lifting.
 */
export function TileStrip({
  tiles,
  size = 'sm',
  className,
}: {
  tiles: Tile[];
  /** `lg` is the dashboard figure size; `sm` is the list-page summary. */
  size?: 'sm' | 'lg';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3',
        className,
      )}
    >
      {tiles?.map((tile, index) => {
        const Arrow =
          tile.deltaTone === 'up'
            ? ArrowUpRight
            : tile.deltaTone === 'down'
              ? ArrowDownRight
              : null;
        const inside = (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xs uppercase tracking-label text-muted-foreground">
                {tile.label}
              </div>
              {tile.icon && (
                <div className="grid size-8 flex-none place-items-center rounded-lg bg-brand/10 text-brand-700">
                  <tile.icon className="size-4" strokeWidth={2} />
                </div>
              )}
            </div>
            <div
              className={cn(
                'font-heading font-extrabold tabular-nums tracking-[-0.02em]',
                size === 'lg' ? 'mt-1.5 text-stat' : 'mt-1 text-xl',
              )}
            >
              {tile.value}
            </div>
            {tile.delta && (
              <div
                className={cn(
                  'mt-1 flex items-center gap-1 text-2xs',
                  DELTA_TONE[tile.deltaTone ?? 'muted'],
                )}
              >
                {Arrow && <Arrow className="size-3" strokeWidth={2.4} />}
                {tile.delta}
              </div>
            )}
            {tile.spark && (
              <Sparkline points={tile.spark} className="mt-2.5 text-brand-500" />
            )}
          </>
        );
        const look = cn(
          'block min-w-0 animate-ems-up rounded-xl border border-divider bg-raised shadow-card',
          size === 'lg' ? 'px-4.5 py-4' : 'px-4 py-3.5',
          tile.to &&
            'transition hover:-translate-y-0.5 hover:shadow-float focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-hidden',
        );
        const style = { animationDelay: `${index * 40}ms` };

        return tile.to ? (
          <Link key={tile.label} to={tile.to} style={style} className={cn(look, '!text-foreground')}>
            {inside}
          </Link>
        ) : (
          <div key={tile.label} style={style} className={look}>
            {inside}
          </div>
        );
      })}
    </div>
  );
}
