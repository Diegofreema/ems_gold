import { cn } from '@/lib/utils'

const LETTERS = 'ABCD'

/** A–D answer rows; picking one tints the row and fills its letter square. */
export function OptionList({
  options,
  chosen,
  onChoose,
}: {
  options: string[]
  chosen?: number
  onChoose: (index: number) => void
}) {
  return (
    <div className="flex flex-col overflow-hidden border-2 border-divider bg-background">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => onChoose(index)}
          aria-pressed={index === chosen}
          className={cn(
            'flex cursor-pointer items-center gap-3.5 border-b-2 border-divider px-[18px] py-4 text-left text-[15px] last:border-b-0',
            'transition-[background-color,padding-left] duration-150 hover:bg-neutral-200 hover:pl-[22px]',
            index === chosen ? 'bg-brand/12' : 'bg-background',
          )}
        >
          <span
            className={cn(
              'grid size-[26px] flex-none place-items-center border-2 font-heading text-xs font-extrabold',
              index === chosen
                ? 'border-brand bg-brand text-background'
                : 'border-divider bg-transparent text-foreground',
            )}
          >
            {LETTERS[index]}
          </span>
          <span className="flex-1">{option}</span>
        </button>
      ))}
    </div>
  )
}
