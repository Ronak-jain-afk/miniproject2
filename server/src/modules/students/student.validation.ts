import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profile: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z.string().optional(),
  }),
  rollNumber: z.string().min(1).max(30),
  registrationNumber: z.string().min(1).max(30),
  department: z.string().regex(/^[a-f\d]{24}$/i),
  course: z.string().regex(/^[a-f\d]{24}$/i),
  currentSemester: z.string().regex(/^[a-f\d]{24}$/i),
  section: z.string().regex(/^[a-f\d]{24}$/i),
  admissionYear: z.number().int().min(2000).max(2100),
});

export const updateStudentSchema = createStudentSchema.partial().omit({ email: true, password: true });

export const updateStudentStatusSchema = z.object({
  status: z.enum(['active', 'graduated', 'suspended', 'discontinued']),
});

export const studentParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
