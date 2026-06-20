import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().max(100).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const departmentParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
