import bcrypt from 'bcrypt';
import { User } from '../users/user.model';
import { Student } from './student.model';
import { paginate } from '../../utils/pagination';
import { AppError } from '../../middleware/errorHandler';
import type { CreateStudentInput, UpdateStudentInput } from './student.validation';

const BCRYPT_COST = 12;

export async function list(query: {
  page?: number; limit?: number; search?: string; department?: string;
  course?: string; semester?: string; section?: string; status?: string;
}) {
  const filter: Record<string, any> = {};
  if (query.department) filter.department = query.department;
  if (query.course) filter.course = query.course;
  if (query.semester) filter.currentSemester = query.semester;
  if (query.section) filter.section = query.section;
  if (query.status) filter.status = query.status;

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
      { rollNumber: { $regex: query.search, $options: 'i' } },
      { registrationNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  return paginate({
    model: Student,
    filter,
    page: query.page,
    limit: query.limit,
    sort: { rollNumber: 1 },
    populate: ['userId', 'department', 'course', 'currentSemester', 'section'],
    select: '-userId.password -userId.refreshToken',
  });
}

export async function getById(id: string) {
  const student = await Student.findById(id)
    .populate(['userId', 'department', 'course', 'currentSemester', 'section'])
    .select('-userId.password -userId.refreshToken');
  if (!student) throw new AppError('Student not found', 404);
  return student;
}

export async function getByUserId(userId: string) {
  const student = await Student.findOne({ userId })
    .populate(['userId', 'department', 'course', 'currentSemester', 'section'])
    .select('-userId.password -userId.refreshToken');
  if (!student) throw new AppError('Student profile not found', 404);
  return student;
}

export async function create(input: CreateStudentInput) {
  const existingEmail = await User.findOne({ email: input.email });
  if (existingEmail) throw new AppError('Email already in use', 409);

  const existingRoll = await Student.findOne({ rollNumber: input.rollNumber });
  if (existingRoll) throw new AppError('Roll number already exists', 409);

  const existingReg = await Student.findOne({ registrationNumber: input.registrationNumber });
  if (existingReg) throw new AppError('Registration number already exists', 409);

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);

  const user = await User.create({
    email: input.email,
    password: hashedPassword,
    role: 'student',
    profile: input.profile,
  });

  const student = await Student.create({
    userId: user._id,
    rollNumber: input.rollNumber,
    registrationNumber: input.registrationNumber,
    department: input.department,
    course: input.course,
    currentSemester: input.currentSemester,
    section: input.section,
    admissionYear: input.admissionYear,
  });

  return student.populate(['userId', 'department', 'course', 'currentSemester', 'section']);
}

export async function update(id: string, input: UpdateStudentInput) {
  const student = await Student.findByIdAndUpdate(id, input, { new: true, runValidators: true })
    .populate(['userId', 'department', 'course', 'currentSemester', 'section'])
    .select('-userId.password -userId.refreshToken');
  if (!student) throw new AppError('Student not found', 404);
  return student;
}

export async function updateStatus(id: string, status: string) {
  const student = await Student.findByIdAndUpdate(id, { status }, { new: true })
    .populate(['userId', 'department', 'course', 'currentSemester', 'section'])
    .select('-userId.password -userId.refreshToken');
  if (!student) throw new AppError('Student not found', 404);
  return student;
}
