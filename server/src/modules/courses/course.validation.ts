import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10),
  department: z.string().regex(/^[a-f\d]{24}$/i),
  duration: z.number().int().min(1).max(6),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
