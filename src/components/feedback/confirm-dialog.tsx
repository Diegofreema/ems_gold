import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export type ConfirmRequest = {
  title: string
  body: string
  /** The record the action applies to, shown in a neutral block. */
  subject: string
  /** Label of the destructive button, e.g. "Delete the pupil". */
  cta: string
  /** Label of the cancel button — "Keep it", "Go back", "Keep working". */
  cancel?: string
  onConfirm: () => void
}

/**
 * The design's destructive confirm: a 2px accent frame over a 58% scrim.
 * Escape and scrim click cancel, both handled by the underlying Dialog.
 */
export function ConfirmDialog({
  request,
  onOpenChange,
}: {
  request: ConfirmRequest | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={Boolean(request)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(460px,100%)] gap-0 border-2 border-brand bg-background p-0 shadow-lg sm:max-w-[460px]"
      >
        {request && (
          <>
            <div className="p-[22px] pb-0">
              <div className="flex items-center gap-2.5">
                <div className="grid size-[22px] flex-none place-items-center bg-brand text-background">
                  <AlertCircle className="size-3.5" strokeWidth={2.6} />
                </div>
                <DialogTitle className="font-heading text-xl font-extrabold">
                  {request.title}
                </DialogTitle>
              </div>
              <DialogDescription className="mt-3.5 text-sm text-muted-foreground">
                {request.body}
              </DialogDescription>
              <div className="mt-4 bg-neutral-100 px-3.5 py-3 text-[13px]">
                {request.subject}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 p-[22px]">
              {/* Closed here rather than with `DialogClose asChild`, which
                  overwrites the button's `data-slot` and so loses the design's
                  44px touch target on a phone. */}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {request.cancel ?? 'Keep it'}
              </Button>
              <Button
                onClick={() => {
                  request.onConfirm()
                  onOpenChange(false)
                }}
              >
                {request.cta}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
