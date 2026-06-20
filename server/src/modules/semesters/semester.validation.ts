import { z } from 'zod';

export const createSemesterSchema = z.object({
  name: z.string().min(1).max(100),
  number: z.number().int().min(1).max(12),
  course: z.string().regex(/^[a-f\d]{24}$/i),
});

export const updateSemesterSchema = createSemesterSchema.partial();

export const semesterParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
