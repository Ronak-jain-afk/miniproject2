import { z } from 'zod';

export const createSectionSchema = z.object({
  name: z.string().min(1).max(10),
  course: z.string().regex(/^[a-f\d]{24}$/i),
  semester: z.string().regex(/^[a-f\d]{24}$/i),
});

export const updateSectionSchema = createSectionSchema.partial();

export const sectionParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
