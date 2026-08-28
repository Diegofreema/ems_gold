/** Accent mark, product name and the portal's role label. */
export function SidebarBrand({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="border-b-2 border-divider px-4 pt-[18px] pb-3.5">
      <div className="flex items-center gap-2.5">
        <div className="size-6 flex-none bg-brand" />
        <div>
          <div className="font-heading text-[15px] leading-none font-extrabold">
            NETPRO EMS
          </div>
          <div className="mt-[3px] text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {roleLabel}
          </div>
        </div>
      </div>
    </div>
  )
}
