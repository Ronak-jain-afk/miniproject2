import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10),
  department: z.string().regex(/^[a-f\d]{24}$/i),
  semester: z.string().regex(/^[a-f\d]{24}$/i),
  credits: z.number().int().min(1).max(10),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export const assignFacultySchema = z.object({
  facultyId: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
