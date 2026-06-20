import { Subject } from './subject.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateSubjectInput, UpdateSubjectInput } from './subject.validation';

export async function list(query: { page?: number; limit?: number; department?: string; semester?: string; faculty?: string; search?: string }) {
  const filter: Record<string, any> = {};
  if (query.department) filter.department = query.department;
  if (query.semester) filter.semester = query.semester;
  if (query.faculty) filter.faculty = query.faculty;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
    ];
  }
  return paginate({
    model: Subject,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { name: 1 },
    populate: ['department', 'semester', 'faculty'],
  });
}

export async function getById(id: string) {
  const subj = await Subject.findById(id).populate(['department', 'semester', 'faculty']);
  if (!subj) throw new AppError('Subject not found', 404);
  return subj;
}

export async function create(input: CreateSubjectInput) {
  const existing = await Subject.findOne({ code: input.code });
  if (existing) throw new AppError('Subject with this code already exists', 409);
  return Subject.create(input);
}

export async function update(id: string, input: UpdateSubjectInput) {
  const subj = await Subject.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate(['department', 'semester', 'faculty']);
  if (!subj) throw new AppError('Subject not found', 404);
  return subj;
}

export async function remove(id: string) {
  const subj = await Subject.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!subj) throw new AppError('Subject not found', 404);
  return subj;
}

export async function assignFaculty(subjectId: string, facultyId: string) {
  const subj = await Subject.findById(subjectId);
  if (!subj) throw new AppError('Subject not found', 404);
  if (subj.faculty.includes(facultyId as any)) throw new AppError('Faculty already assigned', 409);
  subj.faculty.push(facultyId as any);
  await subj.save();
  return subj.populate(['department', 'semester', 'faculty']);
}

export async function removeFaculty(subjectId: string, facultyId: string) {
  const subj = await Subject.findById(subjectId);
  if (!subj) throw new AppError('Subject not found', 404);
  subj.faculty = subj.faculty.filter((id) => id.toString() !== facultyId);
  await subj.save();
  return subj.populate(['department', 'semester', 'faculty']);
}
