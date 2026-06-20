import { z } from 'zod';

export const createFacultySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profile: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z.string().optional(),
  }),
  employeeId: z.string().min(1).max(30),
  department: z.string().regex(/^[a-f\d]{24}$/i),
  joiningDate: z.string().optional(),
  qualification: z.string().max(100).optional(),
  specialization: z.string().max(100).optional(),
});

export const updateFacultySchema = createFacultySchema.partial().omit({ email: true, password: true });

export const facultyParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;
