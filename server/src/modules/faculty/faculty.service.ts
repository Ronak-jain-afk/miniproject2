import bcrypt from 'bcrypt';
import { User } from '../users/user.model';
import { Faculty } from './faculty.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateFacultyInput, UpdateFacultyInput } from './faculty.validation';

const BCRYPT_COST = 12;

export async function list(query: { page?: number; limit?: number; search?: string; department?: string }) {
  const filter: Record<string, any> = {};
  if (query.department) filter.department = query.department;

  if (query.search) {
    const userIds = await User.find({
      $or: [
        { email: { $regex: query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: query.search, $options: 'i' } },
      ],
    }).distinct('_id');

    filter.$or = [
      { userId: { $in: userIds } },
      { employeeId: { $regex: query.search, $options: 'i' } },
    ];
  }

  return paginate({
    model: Faculty,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { employeeId: 1 },
    populate: ['userId', 'department', 'subjects'],
    select: '-userId.password -userId.refreshToken',
  });
}

export async function getById(id: string) {
  const faculty = await Faculty.findById(id)
    .populate(['userId', 'department', 'subjects'])
    .select('-userId.password -userId.refreshToken');
  if (!faculty) throw new AppError('Faculty not found', 404);
  return faculty;
}

export async function getByUserId(userId: string) {
  const faculty = await Faculty.findOne({ userId })
    .populate(['userId', 'department', 'subjects'])
    .select('-userId.password -userId.refreshToken');
  if (!faculty) throw new AppError('Faculty profile not found', 404);
  return faculty;
}

export async function create(input: CreateFacultyInput) {
  const existingEmail = await User.findOne({ email: input.email });
  if (existingEmail) throw new AppError('Email already in use', 409);

  const existingEmp = await Faculty.findOne({ employeeId: input.employeeId });
  if (existingEmp) throw new AppError('Employee ID already exists', 409);

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);

  const user = await User.create({
    email: input.email,
    password: hashedPassword,
    role: 'faculty',
    profile: input.profile,
  });

  const faculty = await Faculty.create({
    userId: user._id,
    employeeId: input.employeeId,
    department: input.department,
    joiningDate: input.joiningDate ? new Date(input.joiningDate) : undefined,
    qualification: input.qualification,
    specialization: input.specialization,
  });

  return faculty.populate(['userId', 'department', 'subjects']);
}

export async function update(id: string, input: UpdateFacultyInput) {
  const updateData: Record<string, any> = { ...input };
  if (input.joiningDate) updateData.joiningDate = new Date(input.joiningDate);

  const faculty = await Faculty.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate(['userId', 'department', 'subjects'])
    .select('-userId.password -userId.refreshToken');
  if (!faculty) throw new AppError('Faculty not found', 404);
  return faculty;
}

export async function getAssignedSubjects(facultyId: string) {
  const faculty = await Faculty.findById(facultyId).populate('subjects');
  if (!faculty) throw new AppError('Faculty not found', 404);
  return faculty.subjects;
}

export async function getWorkload(facultyId: string) {
  const faculty = await Faculty.findById(facultyId).populate('subjects');
  if (!faculty) throw new AppError('Faculty not found', 404);

  const { Session } = await import('../attendance/session.model');
  const totalClasses = await Session.countDocuments({ faculty: facultyId });

  return {
    totalSubjects: faculty.subjects.length,
    totalClasses,
    subjects: faculty.subjects,
  };
}
