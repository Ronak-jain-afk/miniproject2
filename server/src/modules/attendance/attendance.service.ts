import { Session } from './session.model';
import { AttendanceRecord } from './attendance-record.model';
import { Student } from '../students/student.model';
import { Subject } from '../subjects/subject.model';
import { Faculty } from '../faculty/faculty.model';
import { AppError } from '../../middleware/errorHandler';
import type { CreateSessionInput, UpdateRecordsInput } from './attendance.validation';

async function getFacultyProfile(userId: string) {
  const faculty = await Faculty.findOne({ userId });
  if (!faculty) throw new AppError('Faculty profile not found', 404);
  return faculty;
}

export async function createSession(input: CreateSessionInput, userId: string) {
  const faculty = await getFacultyProfile(userId);
  const facultyId = faculty._id.toString();
  const date = new Date(input.date);
  date.setHours(0, 0, 0, 0);

  const existing = await Session.findOne({
    subject: input.subject,
    section: input.section,
    faculty: facultyId,
    date,
  });

  if (existing) {
    const records = await AttendanceRecord.find({ session: existing._id })
      .populate({ path: 'student', populate: { path: 'userId', select: '-password -refreshToken' } });
    return { session: existing, records, isNew: false };
  }

  const subject = await Subject.findById(input.subject);
  const students = await Student.find({
    section: input.section,
    status: 'active',
    ...(subject ? { currentSemester: subject.semester } : {}),
  });

  const session = await Session.create({
    subject: input.subject,
    section: input.section,
    faculty: facultyId,
    date,
    startTime: new Date(),
    totalStudents: students.length,
  });

  const recordDocs = students.map((s) => ({
    session: session._id,
    student: s._id,
    status: 'present' as const,
    markedBy: facultyId,
  }));

  await AttendanceRecord.insertMany(recordDocs);

  return {
    session,
    records: await AttendanceRecord.find({ session: session._id })
      .populate({ path: 'student', populate: { path: 'userId', select: '-password -refreshToken' } }),
    isNew: true,
  };
}

export async function getSessions(query: {
  faculty?: string; subject?: string; section?: string; page?: number; limit?: number;
}) {
  const filter: Record<string, any> = {};
  if (query.faculty) filter.faculty = query.faculty;
  if (query.subject) filter.subject = query.subject;
  if (query.section) filter.section = query.section;

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Session.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['subject', 'section', 'faculty']),
    Session.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getSessionDetail(sessionId: string) {
  const session = await Session.findById(sessionId).populate(['subject', 'section', 'faculty']);
  if (!session) throw new AppError('Session not found', 404);

  const records = await AttendanceRecord.find({ session: sessionId })
    .populate({ path: 'student', populate: { path: 'userId', select: '-password -refreshToken' } });

  return { session, records };
}

export async function updateRecords(sessionId: string, input: UpdateRecordsInput, userId: string) {
  const faculty = await getFacultyProfile(userId);
  const facultyId = faculty._id.toString();

  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);
  if (session.status === 'locked') throw new AppError('Session is locked. Cannot modify attendance.', 403);

  const ops: any[] = input.records.map((r) => ({
    updateOne: {
      filter: { session: sessionId, student: r.student },
      update: { $set: { status: r.status, remarks: r.remarks, markedBy: facultyId, modifiedAt: new Date() } },
      upsert: true,
    },
  }));

  await AttendanceRecord.bulkWrite(ops);

  const records = await AttendanceRecord.find({ session: sessionId })
    .populate({ path: 'student', populate: { path: 'userId', select: '-password -refreshToken' } });

  return records;
}

export async function getStudentRecords(studentId: string) {
  const records = await AttendanceRecord.find({ student: studentId })
    .populate({ path: 'session', populate: ['subject', 'faculty'] })
    .sort({ createdAt: -1 });

  return records;
}

export async function getStudentSummary(studentId: string) {
  const student = await Student.findById(studentId);
  if (!student) throw new AppError('Student not found', 404);

  const records = await AttendanceRecord.find({ student: studentId }).populate({
    path: 'session',
    select: 'subject date',
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const excused = records.filter((r) => r.status === 'excused').length;

  const percentage = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;

  const subjectWise: Record<string, { total: number; present: number; percentage: number }> = {};
  for (const r of records) {
    const session = r.session as any;
    const subjId = session?.subject?.toString() || 'unknown';
    if (!subjectWise[subjId]) subjectWise[subjId] = { total: 0, present: 0, percentage: 0 };
    subjectWise[subjId].total += 1;
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') {
      subjectWise[subjId].present += 1;
    }
  }
  for (const key of Object.keys(subjectWise)) {
    subjectWise[key].percentage = Math.round((subjectWise[key].present / subjectWise[key].total) * 100);
  }

  return { total, present, absent, late, excused, percentage, subjectWise };
}
