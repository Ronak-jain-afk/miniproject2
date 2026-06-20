import { Department } from './department.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateDepartmentInput, UpdateDepartmentInput } from './department.validation';

export async function list(query: { page?: number; limit?: number; search?: string; isActive?: string }) {
  const filter: Record<string, any> = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return paginate({ model: Department, filter, page: query.page, limit: query.limit, sort: { name: 1 } });
}

export async function getById(id: string) {
  const dept = await Department.findById(id);
  if (!dept) throw new AppError('Department not found', 404);
  return dept;
}

export async function create(input: CreateDepartmentInput) {
  const existing = await Department.findOne({ $or: [{ name: input.name }, { code: input.code }] });
  if (existing) throw new AppError('Department with this name or code already exists', 409);
  return Department.create(input);
}

export async function update(id: string, input: UpdateDepartmentInput) {
  const dept = await Department.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!dept) throw new AppError('Department not found', 404);
  return dept;
}

export async function remove(id: string) {
  const dept = await Department.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!dept) throw new AppError('Department not found', 404);
  return dept;
}
