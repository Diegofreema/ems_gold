/** Kicker, 34px title and supporting line — every auth screen opens with this. */
export function AuthHeading({
  kicker,
  title,
  description,
}: {
  kicker?: string
  title: string
  description?: string
}) {
  return (
    <>
      {kicker && (
        <div className="text-2xs uppercase tracking-kicker text-brand-700">
          {kicker}
        </div>
      )}
      <h2 className="mt-2.5 text-detail-title">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </>
  )
}
