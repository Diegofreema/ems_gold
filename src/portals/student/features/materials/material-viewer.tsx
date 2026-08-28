import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import type { Row } from '@/features/collections/types'

/** The design's placeholder page has eight text lines at these widths. */
const LINE_WIDTHS = [92, 78, 96, 64, 88, 70, 94, 46]
const PAGES = 12

/** Opening a material shows a reader rather than a record. */
export function MaterialViewer({ material }: { material: Row }) {
  const [pageParam, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const page = Math.min(Math.max(1, pageParam), PAGES)

  const fields = [
    { label: 'Subject', value: material.subject },
    { label: 'Type', value: material.type },
    { label: 'Size', value: material.size },
    { label: 'Added', value: material.added },
    { label: 'Shared by', value: 'Your subject teacher' },
  ]

  return (
    <div>
      <Button asChild variant="ghost" className="mb-3.5 px-1 text-brand">
        <Link to="/student/materials">
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to course materials
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-[18px]">
        <div className="max-w-[60ch]">
          <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
            {material.subject}
          </div>
          <h2 className="mt-2 text-page-title text-pretty">{material.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => toast('Not wired up yet')}>Download</Button>
          <Button variant="outline" onClick={() => toast('Not wired up yet')}>
            Print
          </Button>
        </div>
      </div>
      <Rule />

      <div className="grid items-start gap-[30px] lg:grid-cols-[1.7fr_1fr]">
        <div className="border-2 border-divider bg-neutral-100">
          <div className="flex items-center gap-3 border-b-2 border-divider bg-background px-3.5 py-2.5">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => void setPage(page - 1)}
            >
              <ChevronLeft className="size-3.5" strokeWidth={2} />
            </Button>
            <div className="text-xs tabular-nums text-muted-foreground">
              Page {page} of {PAGES}
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page === PAGES}
              onClick={() => void setPage(page + 1)}
            >
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </Button>
            <div className="flex-1" />
            <div className="text-[11.5px] text-muted-foreground">
              {material.type} · {material.size}
            </div>
          </div>

          <div
            key={page}
            className="m-5 min-h-[460px] animate-ems-up bg-background px-11 py-10 shadow-md"
          >
            <div className="font-heading text-[19px] font-extrabold">
              {material.title}
            </div>
            <div className="mt-1 text-[11.5px] uppercase tracking-[0.06em] text-muted-foreground">
              Page {page}
            </div>
            <div className="mt-[26px] flex flex-col gap-3" aria-hidden>
              {LINE_WIDTHS.map((width, index) => (
                <div
                  key={index}
                  style={{ width: `${width}%` }}
                  className="h-2.5 bg-neutral-200"
                />
              ))}
            </div>
            <div className="mt-[34px] text-xs text-muted-foreground">
              The real document renders here. This is a placeholder for the file
              the teacher uploaded.
            </div>
          </div>
        </div>

        <aside>
          <h4 className="mb-3.5 text-xl">About this material</h4>
          <div className="border-t-2 border-divider">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex gap-4 border-b border-divider px-0.5 py-3"
              >
                <div className="w-[42%] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {field.label}
                </div>
                <div className="flex-1 text-[13.5px]">{field.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
            Materials stay in your portal until the end of the session, whether
            or not you download them.
          </p>
        </aside>
      </div>
    </div>
  )
}
