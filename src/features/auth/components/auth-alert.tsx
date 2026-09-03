import { CircleAlert } from 'lucide-react'

/** A failed sign-in shakes; everything else about it matches the form banner. */
export function AuthAlert({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="alert"
      className="mb-5.5 flex animate-ems-shake gap-3 rounded-lg border border-danger/50 bg-danger-subtle px-4 py-3.5"
    >
      <CircleAlert
        className="mt-px size-4.5 flex-none text-danger-ink"
        strokeWidth={2.2}
      />
      <div>
        <div className="font-heading text-sm font-extrabold">{title}</div>
        <div className="mt-0.75 text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  )
}
