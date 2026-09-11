/**
 * The blue half of the sign-in design: what the system is for, the student it
 * is for, and the ripple she is sitting in.
 *
 * Hidden below lg. The design draws no narrow view, and a poster costs a phone
 * a photograph to say something the form beside it already says — on the
 * connections this app is for, that is a poster worth dropping.
 */
export function AuthPoster() {
  return (
    <aside className="relative hidden overflow-hidden bg-auth-blue lg:block">
      <Ripple />

      {/* Translucent rather than filled, so the ripple carries on through it —
          the rings are one drawing, not two that have to line up at the edge. */}
      <div className="absolute top-[6.5%] right-[10.5%] bottom-[5.3%] left-[9.7%] overflow-hidden rounded-[10px] border border-white/40 bg-white/25">
        <div className="px-[6.3%] pt-24 text-white">
          <h1 className="max-w-[9em] font-heading text-[46px] leading-[1.2] font-extrabold tracking-[-0.02em]">
            One School one record
          </h1>
          <p className="mt-3 max-w-[27rem] text-base leading-[1.45]">
            Fees, result, attendance and admission in one single system, the
            office, staff room, and home all read from.
          </p>
        </div>

        {/* Decorative: the sentence above is what this panel says, and a
            screen reader that announced a stock photograph of a student would
            be announcing something the page does not mean. */}
        <img
          src="/auth-student.webp"
          alt=""
          className="absolute bottom-[1.6%] left-[50.7%] w-[57.4%] -translate-x-1/2"
        />
      </div>
    </aside>
  )
}

/**
 * The rings, centred on the foot of the panel so they read as ripples under
 * the student rather than a target behind her.
 *
 * Drawn rather than gradient-filled: `slice` scales one drawing to whatever
 * shape the column ends up, so the rings keep their spacing on a laptop and a
 * 27-inch screen alike, and the circles stay circles.
 */
function Ripple() {
  return (
    <svg
      viewBox="0 0 568 756"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="absolute inset-0 size-full"
    >
      <g fill="none" stroke="var(--auth-ring)">
        <circle cx="288" cy="750" r="234" strokeWidth="52" />
        <circle cx="288" cy="750" r="312" strokeWidth="54" />
        <circle cx="288" cy="750" r="420" strokeWidth="66" />
      </g>
    </svg>
  )
}
