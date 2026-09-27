import { PersonAvatar } from '@/components/common/person-avatar'

/** The photo (or the initials), the kicker, the name and the role line. */
export function ProfileIdentity({
  initials,
  photo,
  name,
  meta,
}: {
  initials: string
  photo?: string
  name: string
  meta: string
}) {
  return (
    <div className="flex flex-wrap items-start gap-4.5">
      <PersonAvatar
        name={name}
        photo={photo}
        initials={initials}
        className="flex-none"
        // The design's own block — brand fill, white letters — for whoever
        // has no photo yet.
        fallbackClassName="bg-brand text-xl text-white"
      />
      <div className="min-w-[220px] flex-1">
        <div className="text-2xs uppercase tracking-kicker text-brand-700">
          My account
        </div>
        <h2 className="mt-2 text-page-title">{name}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{meta}</p>
      </div>
    </div>
  )
}
