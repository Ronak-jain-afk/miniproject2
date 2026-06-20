import { Session } from '../attendance/session.model';
import { AttendanceRecord } from '../attendance/attendance-record.model';
import { Student } from '../students/student.model';
import { Faculty } from '../faculty/faculty.model';
import { Department } from '../departments/department.model';
import { Subject } from '../subjects/subject.model';
import { AttendanceRule } from '../rules/rule.model';

async function resolveThreshold() {
  const global = await AttendanceRule.findOne({ department: { $exists: false }, semester: { $exists: false } });
  return global?.minimumPercentage ?? 75;
}

export async function facultyDashboard(facultyId: string) {
  const sessions = await Session.find({ faculty: facultyId }).populate('subject');
  const sessionIds = sessions.map((s) => s._id);

  const records = await AttendanceRecord.find({ session: { $in: sessionIds } });
  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
  const avgPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const subjectStats: Record<string, { total: number; present: number; name: string }> = {};
  for (const r of records) {
    const session = sessions.find((s) => s._id.toString() === r.session.toString());
    const subjId = session?.subject?._id?.toString() || 'unknown';
    const subjName = (session?.subject as any)?.name || 'Unknown';
    if (!subjectStats[subjId]) subjectStats[subjId] = { total: 0, present: 0, name: subjName };
    subjectStats[subjId].total += 1;
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') subjectStats[subjId].present += 1;
  }

  const threshold = await resolveThreshold();

  const studentRecords: Record<string, { total: number; present: number; name: string }> = {};
  for (const r of records) {
    const sid = r.student.toString();
    if (!studentRecords[sid]) studentRecords[sid] = { total: 0, present: 0, name: sid };
    studentRecords[sid].total += 1;
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') studentRecords[sid].present += 1;
  }
  const lowAttendanceStudents = Object.entries(studentRecords)
    .filter(([, v]) => v.total > 0 && Math.round((v.present / v.total) * 100) < threshold)
    .length;

  const trends = await AttendanceRecord.aggregate([
    { $match: { session: { $in: sessionIds } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  return {
    totalClasses: sessions.length,
    avgPercentage,
    lowAttendanceStudents,
    subjectStats: Object.entries(subjectStats).map(([id, s]) => ({ id, ...s, percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 })),
    trends: trends.map((t) => ({ date: t._id, percentage: t.total > 0 ? Math.round((t.present / t.total) * 100) : 0 })),
  };
}

export async function studentDashboard(studentId: string) {
  const records = await AttendanceRecord.find({ student: studentId })
    .populate({ path: 'session', populate: 'subject' });

  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const subjectWise: Record<string, { total: number; present: number; name: string; percentage: number }> = {};
  for (const r of records) {
    const subjId = (r.session as any)?.subject?._id?.toString() || 'unknown';
    const subjName = (r.session as any)?.subject?.name || 'Unknown';
    if (!subjectWise[subjId]) subjectWise[subjId] = { total: 0, present: 0, name: subjName, percentage: 0 };
    subjectWise[subjId].total += 1;
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') subjectWise[subjId].present += 1;
  }
  for (const key of Object.keys(subjectWise)) {
    subjectWise[key].percentage = subjectWise[key].total > 0 ? Math.round((subjectWise[key].present / subjectWise[key].total) * 100) : 0;
  }

  const monthlyTrends = await AttendanceRecord.aggregate([
    { $match: { student: studentId as any } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const threshold = await resolveThreshold();

  return {
    total, present, absent, late, excused, percentage,
    belowThreshold: percentage < threshold,
    threshold,
    subjectWise: Object.values(subjectWise),
    monthlyTrends: monthlyTrends.map((t) => ({ month: t._id, percentage: t.total > 0 ? Math.round((t.present / t.total) * 100) : 0 })),
  };
}

export async function adminDashboard() {
  const [totalStudents, totalFaculty, totalDepts, sessions] = await Promise.all([
    Student.countDocuments({ status: 'active' }),
    Faculty.countDocuments(),
    Department.countDocuments({ isActive: true }),
    Session.countDocuments(),
  ]);

  const records = await AttendanceRecord.find().populate({ path: 'session', select: 'subject' });
  const total = records.length || 1;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
  const avgAttendance = Math.round((present / total) * 100);

  const deptStats = await Department.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'department',
        as: 'students',
      },
    },
    { $project: { name: 1, code: 1, studentCount: { $size: '$students' } } },
  ]);

  return { totalStudents, totalFaculty, totalDepts, totalSessions: sessions, avgAttendance, deptStats };
}

export async function lowAttendance(query: { department?: string; course?: string; semester?: string }) {
  const filter: Record<string, any> = { status: 'active' };
  if (query.department) filter.department = query.department;
  if (query.course) filter.course = query.course;
  if (query.semester) filter.currentSemester = query.semester;

  const students = await Student.find(filter).populate({ path: 'userId', select: '-password -refreshToken' });
  const threshold = await resolveThreshold();
  const result: any[] = [];

  for (const student of students) {
    const records = await AttendanceRecord.find({ student: student._id });
    const total = records.length;
    if (total === 0) continue;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
    const percentage = Math.round((present / total) * 100);
    if (percentage < threshold) {
      result.push({
        _id: student._id, rollNumber: student.rollNumber, name: `${(student as any).userId?.profile?.firstName || ''} ${(student as any).userId?.profile?.lastName || ''}`,
        percentage, total, present,
      });
    }
  }

  return result.sort((a, b) => a.percentage - b.percentage);
}

export async function attendanceTrends(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return AttendanceRecord.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', percentage: { $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }] }, 0] } } },
  ]);
}

export async function departmentWise() {
  const depts = await Department.find({ isActive: true });

  const result = [];
  for (const dept of depts) {
    const students = await Student.find({ department: dept._id }).distinct('_id');
    const records = await AttendanceRecord.find({ student: { $in: students } });
    const total = records.length;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
    result.push({
      department: dept.name, departmentId: dept._id, totalStudents: students.length, totalRecords: total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    });
  }

  return result;
}
