import { Section } from './section.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateSectionInput, UpdateSectionInput } from './section.validation';

export async function list(query: { page?: number; limit?: number; course?: string; semester?: string }) {
  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (query.semester) filter.semester = query.semester;
  return paginate({
    model: Section,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { name: 1 },
    populate: ['course', 'semester'],
  });
}

export async function getById(id: string) {
  const section = await Section.findById(id).populate(['course', 'semester']);
  if (!section) throw new AppError('Section not found', 404);
  return section;
}

export async function create(input: CreateSectionInput) {
  const existing = await Section.findOne({ semester: input.semester, name: input.name });
  if (existing) throw new AppError('Section already exists for this semester', 409);
  return Section.create(input);
}

export async function update(id: string, input: UpdateSectionInput) {
  const section = await Section.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate(['course', 'semester']);
  if (!section) throw new AppError('Section not found', 404);
  return section;
}

export async function remove(id: string) {
  const section = await Section.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!section) throw new AppError('Section not found', 404);
  return section;
}
