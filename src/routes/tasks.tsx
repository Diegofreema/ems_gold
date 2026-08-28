import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api, type Priority } from '@/lib/api'
import { taskKeys, tasksQueryOptions } from '@/features/tasks/queries'
import {
  priorities,
  taskFormSchema,
  type TaskFormValues,
} from '@/features/tasks/schema'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

const filterValues = ['all', ...priorities] as const

/** Keeps typed <Link search={{...}}> working alongside the nuqs parsers below. */
const taskSearchSchema = z.object({
  q: z.string().optional(),
  priority: z.enum(filterValues).optional(),
})

export const Route = createFileRoute('/tasks')({
  validateSearch: taskSearchSchema,
  component: TasksPage,
})

function TasksPage() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  const [priority, setPriority] = useQueryState(
    'priority',
    parseAsStringLiteral(filterValues).withDefault('all'),
  )

  const density = useUiStore((state) => state.density)
  const setDensity = useUiStore((state) => state.setDensity)

  const queryClient = useQueryClient()
  const tasks = useQuery(tasksQueryOptions({ q, priority }))

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: taskKeys.all })

  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: (task) => {
      toast.success(`Added “${task.title}”`)
      void invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const toggleTask = useMutation({
    mutationFn: api.toggleTask,
    onSuccess: () => void invalidate(),
  })

  const deleteTask = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      toast('Task removed')
      void invalidate()
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Search and filter state live in the URL — reload or share the link.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-1">
          {(['comfortable', 'compact'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={density === option ? 'secondary' : 'ghost'}
              onClick={() => setDensity(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(event) => void setQ(event.target.value || null)}
          placeholder="Search tasks…"
          className="max-w-xs"
        />
        <Select
          value={priority}
          onValueChange={(value) =>
            void setPriority(value === 'all' ? null : (value as Priority))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {filterValues.map((value) => (
              <SelectItem key={value} value={value}>
                {value === 'all' ? 'All priorities' : value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(q || priority !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              void setQ(null)
              void setPriority(null)
            }}
          >
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section
          className={cn(
            'space-y-3',
            tasks.isPlaceholderData && 'opacity-60 transition-opacity',
          )}
        >
          {tasks.isPending ? (
            <div className="space-y-3">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-20 w-full" />
              ))}
            </div>
          ) : tasks.isError ? (
            <p className="text-sm text-destructive">
              Couldn&apos;t load tasks. {tasks.error.message}
            </p>
          ) : tasks.data.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nothing matches these filters.
              </CardContent>
            </Card>
          ) : (
            tasks.data.map((task) => (
              <Card key={task.id}>
                <CardContent
                  className={cn(
                    'flex items-start gap-4',
                    density === 'compact' ? 'py-3' : 'py-5',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    aria-label={`Mark ${task.title} as done`}
                    onChange={() => toggleTask.mutate(task.id)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className={cn(
                        'font-medium',
                        task.done && 'text-muted-foreground line-through',
                      )}
                    >
                      {task.title}
                    </p>
                    {task.notes && density === 'comfortable' && (
                      <p className="text-sm text-muted-foreground">
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <Badge variant={badgeVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask.mutate(task.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <NewTaskCard
          pending={createTask.isPending}
          onCreate={(values) => createTask.mutateAsync(values)}
        />
      </div>
    </div>
  )
}

function badgeVariant(priority: Priority) {
  if (priority === 'high') return 'destructive' as const
  if (priority === 'medium') return 'default' as const
  return 'secondary' as const
}

function NewTaskCard({
  pending,
  onCreate,
}: {
  pending: boolean
  onCreate: (values: TaskFormValues) => Promise<unknown>
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: '', notes: '', priority: 'medium' },
  })

  const onSubmit = handleSubmit(async (values) => {
    await onCreate(values)
    reset()
  })

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">New task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                aria-invalid={!!errors.title}
                {...register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="priority">Priority</FieldLabel>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.priority]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" rows={3} {...register('notes')} />
              <FieldDescription>Optional, up to 280 characters.</FieldDescription>
              <FieldError errors={[errors.notes]} />
            </Field>

            <Button type="submit" disabled={pending}>
              {pending ? 'Adding…' : 'Add task'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
