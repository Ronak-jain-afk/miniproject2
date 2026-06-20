import { z } from 'zod';

export const createRuleSchema = z.object({
  department: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  semester: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  minimumPercentage: z.number().min(0).max(100).default(75),
  lateCountsAsPresent: z.boolean().default(false),
  excusedCountsAsPresent: z.boolean().default(true),
  freezePeriodHours: z.number().min(1).default(24),
  warningThresholds: z.array(z.number()).default([75, 65, 50]),
  consecutiveAbsenceLimit: z.number().min(1).default(5),
});

export const updateRuleSchema = createRuleSchema.partial();

export const ruleParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
