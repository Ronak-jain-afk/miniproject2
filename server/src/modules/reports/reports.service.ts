import PDFDocument from 'pdfkit';
import { AttendanceRecord } from '../attendance/attendance-record.model';
import { Session } from '../attendance/session.model';
import { Student } from '../students/student.model';

function addTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], startY: number) {
  const colWidth = 470 / headers.length;
  let y = startY;

  doc.fontSize(9).font('Helvetica-Bold');
  headers.forEach((h, i) => doc.text(h, 50 + i * colWidth, y, { width: colWidth }));
  y += 18;
  doc.font('Helvetica');

  for (const row of rows) {
    if (y > 720) { doc.addPage(); y = 50; }
    row.forEach((cell, i) => doc.text(cell, 50 + i * colWidth, y, { width: colWidth }));
    y += 16;
  }
}

export async function generateStudentReport(studentId: string): Promise<Buffer> {
  const student = await Student.findById(studentId).populate(['userId', 'department', 'course', 'currentSemester', 'section']);
  if (!student) throw new Error('Student not found');

  const records = await AttendanceRecord.find({ student: studentId })
    .populate({ path: 'session', populate: 'subject' })
    .sort({ createdAt: -1 });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(18).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(11).font('Helvetica-Bold').text(`Student: ${(student as any).userId?.profile?.firstName || ''} ${(student as any).userId?.profile?.lastName || ''}`);
  doc.font('Helvetica').fontSize(10);
  doc.text(`Roll No: ${student.rollNumber}`);
  doc.text(`Department: ${(student as any).department?.name || ''}`);
  doc.text(`Course: ${(student as any).course?.name || ''}  |  Semester: ${(student as any).currentSemester?.name || ''}  |  Section: ${(student as any).section?.name || ''}`);
  doc.moveDown();

  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  doc.text(`Total Classes: ${total}  |  Present: ${present}  |  Percentage: ${percentage}%`);
  doc.moveDown();

  const headers = ['Date', 'Subject', 'Status', 'Remarks'];
  const rows = records.map((r) => [
    (r.session as any)?.date ? new Date((r.session as any).date).toLocaleDateString() : '—',
    (r.session as any)?.subject?.name || '—',
    r.status,
    r.remarks || '—',
  ]);

  addTable(doc, headers, rows, doc.y);

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

export async function generateSubjectReport(subjectId: string): Promise<Buffer> {
  const sessions = await Session.find({ subject: subjectId }).populate('subject');
  const sessionIds = sessions.map((s) => s._id);
  const records = await AttendanceRecord.find({ session: { $in: sessionIds } })
    .populate({ path: 'student', populate: { path: 'userId', select: '-password -refreshToken' } });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(18).text('Subject Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(11).text(`Subject: ${(sessions[0] as any)?.subject?.name || ''}`);
  doc.text(`Total Sessions: ${sessions.length}  |  Total Records: ${records.length}`);
  doc.moveDown();

  const headers = ['Roll No', 'Student Name', 'Status', 'Date'];
  const rows = records.map((r) => [
    (r.student as any)?.rollNumber || '—',
    `${(r.student as any)?.userId?.profile?.firstName || ''} ${(r.student as any)?.userId?.profile?.lastName || ''}`,
    r.status,
    (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString() : '—',
  ]);

  addTable(doc, headers, rows, doc.y);

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

export async function generateDefaulterReport(): Promise<Buffer> {
  const records = await AttendanceRecord.find().populate({
    path: 'student', populate: { path: 'userId', select: '-password -refreshToken' },
  });

  const studentMap: Record<string, { total: number; present: number; name: string; roll: string }> = {};
  for (const r of records) {
    const sid = r.student?.toString() || 'unknown';
    if (!studentMap[sid]) {
      const s = r.student as any;
      studentMap[sid] = { total: 0, present: 0, name: `${s?.userId?.profile?.firstName || ''} ${s?.userId?.profile?.lastName || ''}`, roll: s?.rollNumber || '' };
    }
    studentMap[sid].total += 1;
    if (r.status === 'present' || r.status === 'late' || r.status === 'excused') studentMap[sid].present += 1;
  }

  const defaulters = Object.entries(studentMap)
    .filter(([, v]) => v.total > 0 && Math.round((v.present / v.total) * 100) < 75)
    .sort(([, a], [, b]) => (a.present / a.total) - (b.present / b.total));

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(18).text('Defaulter List', { align: 'center' });
  doc.moveDown();
  doc.fontSize(11).text(`Total Defaulters: ${defaulters.length}  (Attendance below 75%)`);
  doc.moveDown();

  const headers = ['Roll No', 'Name', 'Total', 'Present', '%'];
  const rows = defaulters.map(([, v]) => [
    v.roll,
    v.name,
    v.total.toString(),
    v.present.toString(),
    `${Math.round((v.present / v.total) * 100)}%`,
  ]);

  addTable(doc, headers, rows, doc.y);

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}
