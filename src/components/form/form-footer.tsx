import { Button } from '@/components/ui/button'

/** Save and cancel on the left, the destructive action pushed far right. */
export function FormFooter({
  submitLabel,
  onCancel,
  deleteLabel,
  onDelete,
  pending,
  blocked,
}: {
  submitLabel: string
  onCancel: () => void
  /** Only rendered in edit mode. */
  deleteLabel?: string
  onDelete?: () => void
  pending?: boolean
  /**
   * Why this form cannot be saved right now, where something stands in the way
   * that is not the form's own contents — a write this app cannot hold on the
   * device, with no connection to send it over. Said beside the button rather
   * than after pressing it.
   */
  blocked?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button type="submit" pending={pending} disabled={Boolean(blocked)}>
        {submitLabel}
      </Button>
      {/* Both are shut while the save is in flight: leaving the page or
          deleting the record mid-write is not something to offer. */}
      <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      <div className="flex-1" />
      {deleteLabel && onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={pending}
        >
          {deleteLabel}
        </Button>
      )}
    </div>
  )
}
