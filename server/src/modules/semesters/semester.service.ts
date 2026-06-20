import { Semester } from './semester.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateSemesterInput, UpdateSemesterInput } from './semester.validation';

export async function list(query: { page?: number; limit?: number; course?: string }) {
  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  return paginate({
    model: Semester,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { number: 1 },
    populate: 'course',
  });
}

export async function getById(id: string) {
  const sem = await Semester.findById(id).populate('course');
  if (!sem) throw new AppError('Semester not found', 404);
  return sem;
}

export async function create(input: CreateSemesterInput) {
  const existing = await Semester.findOne({ course: input.course, number: input.number });
  if (existing) throw new AppError('Semester already exists for this course', 409);
  return Semester.create(input);
}

export async function update(id: string, input: UpdateSemesterInput) {
  const sem = await Semester.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('course');
  if (!sem) throw new AppError('Semester not found', 404);
  return sem;
}

export async function remove(id: string) {
  const sem = await Semester.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!sem) throw new AppError('Semester not found', 404);
  return sem;
}
