import { AttendanceRule, IAttendanceRule } from './rule.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateRuleInput, UpdateRuleInput } from './rule.validation';

export async function list() {
  return paginate({
    model: AttendanceRule,
    sort: { createdAt: -1 },
    populate: ['department', 'semester'],
  });
}

export async function getById(id: string) {
  const rule = await AttendanceRule.findById(id).populate(['department', 'semester']);
  if (!rule) throw new AppError('Rule not found', 404);
  return rule;
}

export async function create(input: CreateRuleInput) {
  return AttendanceRule.create(input);
}

export async function update(id: string, input: UpdateRuleInput) {
  const rule = await AttendanceRule.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate(['department', 'semester']);
  if (!rule) throw new AppError('Rule not found', 404);
  return rule;
}

export async function remove(id: string) {
  const rule = await AttendanceRule.findByIdAndDelete(id);
  if (!rule) throw new AppError('Rule not found', 404);
  return rule;
}

export async function resolveRules(departmentId?: string, semesterId?: string): Promise<IAttendanceRule> {
  if (departmentId && semesterId) {
    const rule = await AttendanceRule.findOne({ department: departmentId, semester: semesterId });
    if (rule) return rule;
  }

  if (departmentId) {
    const rule = await AttendanceRule.findOne({ department: departmentId, semester: { $exists: false } });
    if (rule) return rule;
  }

  if (semesterId) {
    const rule = await AttendanceRule.findOne({ semester: semesterId, department: { $exists: false } });
    if (rule) return rule;
  }

  const global = await AttendanceRule.findOne({ department: { $exists: false }, semester: { $exists: false } });
  if (global) return global;

  return {
    minimumPercentage: 75,
    lateCountsAsPresent: false,
    excusedCountsAsPresent: true,
    freezePeriodHours: 24,
    warningThresholds: [75, 65, 50],
    consecutiveAbsenceLimit: 5,
  } as IAttendanceRule;
}
