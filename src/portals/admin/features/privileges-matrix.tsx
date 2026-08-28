import { Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SectionHeading } from '@/components/common/section-heading'
import { Tag } from '@/components/common/tag'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ADMINS = [
  { id: 0, name: 'Amaka Okonkwo', role: 'Bursar', scope: 'Full access' },
  { id: 1, name: 'Samuel Idowu', role: 'Bursary clerk', scope: 'Finance only' },
  { id: 2, name: 'Hauwa Abubakar', role: 'Head of Primary', scope: 'Primary only' },
  { id: 3, name: 'Emeka Duru', role: 'ICT', scope: 'Limited' },
]

const MODULES = [
  { key: 'fees', label: 'Fees & invoices', hint: 'Catalogue, invoices, collection' },
  { key: 'students', label: 'Pupils & parents', hint: 'Register, applicants, parent accounts' },
  { key: 'staff', label: 'Staff', hint: 'Records, subjects, mail' },
  { key: 'academics', label: 'Academics', hint: 'Classes, arms, subjects, results' },
  { key: 'money', label: 'Spendings & analytics', hint: 'Ledger and reports' },
  { key: 'school', label: 'School settings', hint: 'Sessions, terms, privileges' },
] as const

/** Each module holds a bitmask: 1 = view, 2 = edit. */
const VIEW = 1
const EDIT = 2

type Grants = Record<string, number>

const DEFAULTS: Record<number, Grants> = {
  0: { fees: 3, students: 3, staff: 3, academics: 3, money: 3, school: 3 },
  1: { fees: 3, students: 1, staff: 0, academics: 0, money: 3, school: 0 },
  2: { fees: 1, students: 3, staff: 1, academics: 3, money: 0, school: 0 },
  3: { fees: 0, students: 1, staff: 1, academics: 1, money: 0, school: 1 },
}

export function PrivilegesMatrix() {
  const [selected, setSelected] = useState(0)
  const [grants, setGrants] = useState(DEFAULTS)
  const current = grants[selected] ?? {}

  const toggle = (moduleKey: string, bit: number) =>
    setGrants((previous) => ({
      ...previous,
      [selected]: {
        ...previous[selected],
        [moduleKey]: (previous[selected]?.[moduleKey] ?? 0) ^ bit,
      },
    }))

  return (
    <div>
      <PageHeader
        kicker="School"
        title="Roles & privileges"
        description="Pick an administrator, then say what they may see and what they may change. Changes take effect the next time they sign in."
      />
      <Rule />

      <div className="grid gap-[30px] lg:grid-cols-[minmax(0,300px)_1fr]">
        <section>
          <SectionHeading className="mb-3">Administrator</SectionHeading>
          <div className="border-2 border-divider">
            {ADMINS.map((admin) => (
              <button
                key={admin.id}
                type="button"
                onClick={() => setSelected(admin.id)}
                aria-pressed={admin.id === selected}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 border-b border-divider border-l-2 px-3.5 py-3 text-left transition-colors hover:bg-neutral-200',
                  admin.id === selected
                    ? 'border-l-brand bg-brand/10'
                    : 'border-l-transparent',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{admin.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {admin.role}
                  </div>
                </div>
                <Tag variant={admin.scope === 'Full access' ? 'neutral' : 'outline'}>
                  {admin.scope}
                </Tag>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline gap-2.5">
            <h6 className="text-[13px] uppercase tracking-[0.08em] text-brand-700">
              {ADMINS[selected].name}
            </h6>
            <div className="h-px flex-1 bg-divider" />
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              View · Edit
            </div>
          </div>

          <div className="border-2 border-divider">
            {MODULES.map((module, index) => (
              <div
                key={module.key}
                style={{ animationDelay: `${index * 28}ms` }}
                className="flex animate-ems-row items-center gap-3.5 border-b border-divider px-[15px] py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{module.label}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {module.hint}
                  </div>
                </div>
                {[VIEW, EDIT].map((bit) => {
                  const on = ((current[module.key] ?? 0) & bit) === bit
                  const verb = bit === VIEW ? 'View' : 'Edit'
                  return (
                    <button
                      key={bit}
                      type="button"
                      onClick={() => toggle(module.key, bit)}
                      title={`${verb} ${module.label}`}
                      aria-label={`${verb} ${module.label}`}
                      aria-pressed={on}
                      className={cn(
                        'grid size-[22px] flex-none cursor-pointer place-items-center border-2 p-0',
                        on ? 'border-brand bg-brand' : 'border-divider bg-transparent',
                      )}
                    >
                      <Check
                        className={cn('size-[13px]', on ? 'text-background' : 'text-transparent')}
                        strokeWidth={3.4}
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-[18px] flex gap-2.5">
            <Button onClick={() => toast('Privileges saved')}>Save privileges</Button>
            <Button variant="ghost" className="text-brand" onClick={() => toast('Not wired up yet')}>
              See their activity log
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
