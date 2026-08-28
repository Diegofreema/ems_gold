import { z } from 'zod'

export const priorities = ['low', 'medium', 'high'] as const

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Give the task a title of at least 3 characters.')
    .max(80, 'Keep the title under 80 characters.'),
  notes: z.string().trim().max(280, 'Notes cap out at 280 characters.').optional(),
  priority: z.enum(priorities, { message: 'Pick a priority.' }),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
