import { Course } from './course.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateCourseInput, UpdateCourseInput } from './course.validation';

export async function list(query: { page?: number; limit?: number; department?: string; search?: string }) {
  const filter: Record<string, any> = {};
  if (query.department) filter.department = query.department;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
    ];
  }
  return paginate({
    model: Course,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { name: 1 },
    populate: 'department',
    select: 'name code department duration isActive',
  });
}

export async function getById(id: string) {
  const course = await Course.findById(id).populate('department');
  if (!course) throw new AppError('Course not found', 404);
  return course;
}

export async function create(input: CreateCourseInput) {
  const existing = await Course.findOne({ code: input.code });
  if (existing) throw new AppError('Course with this code already exists', 409);
  return Course.create(input);
}

export async function update(id: string, input: UpdateCourseInput) {
  const course = await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('department');
  if (!course) throw new AppError('Course not found', 404);
  return course;
}

export async function remove(id: string) {
  const course = await Course.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!course) throw new AppError('Course not found', 404);
  return course;
}
