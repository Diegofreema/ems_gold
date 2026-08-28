import { useGSAP } from '@gsap/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import gsap from 'gsap'
import { useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

gsap.registerPlugin(useGSAP)

export const Route = createFileRoute('/')({
  component: Home,
})

const stack = [
  { name: 'TanStack Router', role: 'File-based routing + typed links' },
  { name: 'TanStack Query', role: 'Server state, caching, mutations' },
  { name: 'nuqs', role: 'Filters and search live in the URL' },
  { name: 'Zustand', role: 'App-wide client preferences' },
  { name: 'Zod + RHF', role: 'One schema, validated everywhere' },
  { name: 'shadcn + Tailwind v4', role: 'Owned components, CSS-first theme' },
]

function Home() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.7 },
      })

      timeline
        .from('[data-animate="hero"]', { y: 24, opacity: 0, stagger: 0.08 })
        .from(
          '[data-animate="card"]',
          { y: 20, opacity: 0, stagger: 0.06, duration: 0.5 },
          '-=0.35',
        )
    },
    { scope: container },
  )

  return (
    <div ref={container} className="space-y-12">
      <section className="space-y-5">
        <Badge data-animate="hero" variant="secondary">
          React 19 · Vite
        </Badge>
        <h1
          data-animate="hero"
          className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          A scaffold that already knows where state belongs.
        </h1>
        <p data-animate="hero" className="max-w-xl text-muted-foreground">
          URL state in nuqs, server state in TanStack Query, preferences in
          Zustand, and form state validated by a single Zod schema.
        </p>
        <div data-animate="hero" className="flex gap-3">
          <Button asChild>
            <Link to="/tasks">See it wired up</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/tasks" search={{ priority: 'high' }}>
              Jump to high priority
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stack.map((item) => (
          <Card key={item.name} data-animate="card">
            <CardHeader>
              <CardTitle className="text-base">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.role}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
