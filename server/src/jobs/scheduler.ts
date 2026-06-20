import cron from 'node-cron';
import { Session } from '../modules/attendance/session.model';
import { AttendanceRecord } from '../modules/attendance/attendance-record.model';
import { AttendanceRule } from '../modules/rules/rule.model';
import { Student } from '../modules/students/student.model';
import { logger } from '../config/logger';

async function lockExpiredSessions() {
  const globalRule = await AttendanceRule.findOne({ department: { $exists: false }, semester: { $exists: false } });
  const freezeHours = globalRule?.freezePeriodHours ?? 24;
  const cutoff = new Date(Date.now() - freezeHours * 60 * 60 * 1000);

  const result = await Session.updateMany(
    { status: 'active', createdAt: { $lte: cutoff } },
    { $set: { status: 'locked' } }
  );

  if (result.modifiedCount > 0) {
    logger.info(`Locked ${result.modifiedCount} expired sessions`);
  }
}

async function checkAttendanceThresholds() {
  const globalRule = await AttendanceRule.findOne({ department: { $exists: false }, semester: { $exists: false } });
  const threshold = globalRule?.minimumPercentage ?? 75;
  const consecutiveLimit = globalRule?.consecutiveAbsenceLimit ?? 5;

  const students = await Student.find({ status: 'active' });

  for (const student of students) {
    const records = await AttendanceRecord.find({ student: student._id }).sort({ createdAt: -1 });

    if (records.length === 0) continue;

    const total = records.length;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
    const percentage = Math.round((present / total) * 100);

    if (percentage < threshold) {
      logger.info({ studentId: student._id, percentage }, 'Student below attendance threshold');
    }

    const recentRecords = records.slice(0, consecutiveLimit);
    const consecutiveAbsent = recentRecords.every((r: any) => r.status === 'absent');
    if (consecutiveAbsent && recentRecords.length >= consecutiveLimit) {
      logger.info({ studentId: student._id }, 'Student has consecutive absences');
    }
  }
}

export function startScheduledJobs() {
  cron.schedule('0 * * * *', () => {
    lockExpiredSessions().catch((err) => logger.error(err, 'Lock expired sessions job failed'));
  });

  cron.schedule('0 6 * * *', () => {
    checkAttendanceThresholds().catch((err) => logger.error(err, 'Threshold check job failed'));
  });

  logger.info('Scheduled jobs started (hourly lock check, daily threshold check at 6 AM)');
}
