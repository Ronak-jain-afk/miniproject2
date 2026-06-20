import { z } from 'zod';

export const createSessionSchema = z.object({
  subject: z.string().regex(/^[a-f\d]{24}$/i),
  section: z.string().regex(/^[a-f\d]{24}$/i),
  date: z.string(),
});

export const updateRecordsSchema = z.object({
  records: z.array(
    z.object({
      student: z.string().regex(/^[a-f\d]{24}$/i),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      remarks: z.string().max(200).optional(),
    })
  ),
});

export const sessionParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export const studentQuerySchema = z.object({
  studentId: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateRecordsInput = z.infer<typeof updateRecordsSchema>;
