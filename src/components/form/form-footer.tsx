import { Button } from '@/components/ui/button'

/** Save and cancel on the left, the destructive action pushed far right. */
export function FormFooter({
  submitLabel,
  onCancel,
  deleteLabel,
  onDelete,
  pending,
}: {
  submitLabel: string
  onCancel: () => void
  /** Only rendered in edit mode. */
  deleteLabel?: string
  onDelete?: () => void
  pending?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <div className="flex-1" />
      {deleteLabel && onDelete && (
        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          className="text-brand hover:bg-brand/10 hover:text-brand"
        >
          {deleteLabel}
        </Button>
      )}
    </div>
  )
}
