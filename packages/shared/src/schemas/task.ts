import { z } from 'zod';

const dateSchema = z.string().datetime({ offset: true });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(240),
  dueAt: dateSchema.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  dueAt: dateSchema.nullable().optional(),
  completedAt: dateSchema.nullable().optional(),
});

export const listTasksQuerySchema = z.object({
  overdue: z.coerce.boolean().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;