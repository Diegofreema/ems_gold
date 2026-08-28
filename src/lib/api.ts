export type Priority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  notes?: string
  priority: Priority
  done: boolean
  createdAt: number
}

export type TaskFilters = {
  q: string
  priority: Priority | 'all'
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let tasks: Task[] = [
  {
    id: 'seed-1',
    title: 'Wire up the design tokens',
    notes: 'Audit the neutral ramp before shipping the dark theme.',
    priority: 'high',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'seed-2',
    title: 'Draft the onboarding copy',
    priority: 'medium',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'seed-3',
    title: 'Archive the Q2 experiments',
    priority: 'low',
    done: true,
    createdAt: Date.now() - 1000 * 60 * 90,
  },
]

/** Stand-in for a real HTTP layer — swap the bodies for fetch calls. */
export const api = {
  async listTasks({ q, priority }: TaskFilters): Promise<Task[]> {
    await sleep(350)
    const needle = q.trim().toLowerCase()
    return tasks
      .filter((task) => (priority === 'all' ? true : task.priority === priority))
      .filter((task) =>
        needle ? task.title.toLowerCase().includes(needle) : true,
      )
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  async createTask(
    input: Pick<Task, 'title' | 'priority'> & { notes?: string },
  ): Promise<Task> {
    await sleep(450)
    const task: Task = {
      ...input,
      id: crypto.randomUUID(),
      done: false,
      createdAt: Date.now(),
    }
    tasks = [task, ...tasks]
    return task
  },

  async toggleTask(id: string): Promise<Task> {
    await sleep(200)
    const task = tasks.find((candidate) => candidate.id === id)
    if (!task) throw new Error(`No task with id ${id}`)
    task.done = !task.done
    return task
  },

  async deleteTask(id: string): Promise<{ id: string }> {
    await sleep(200)
    tasks = tasks.filter((task) => task.id !== id)
    return { id }
  },
}
