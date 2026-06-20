import { Request, Response } from 'express';
import * as attendanceService from './attendance.service';
import { Student } from '../students/student.model';

async function resolveStudentId(param: string, userId?: string): Promise<string> {
  if (param === 'me' && userId) {
    const student = await Student.findOne({ userId });
    if (!student) throw new Error('Student profile not found');
    return student._id.toString();
  }
  return param;
}

export async function createSession(req: Request, res: Response) {
  const result = await attendanceService.createSession(req.body, req.user!.userId);
  res.status(result.isNew ? 201 : 200).json({ data: result });
}

export async function getSessions(req: Request, res: Response) {
  const result = await attendanceService.getSessions(req.query as any);
  res.json(result);
}

export async function getSessionDetail(req: Request, res: Response) {
  const result = await attendanceService.getSessionDetail(req.params.id);
  res.json({ data: result });
}

export async function updateRecords(req: Request, res: Response) {
  const records = await attendanceService.updateRecords(req.params.id, req.body, req.user!.userId);
  res.json({ data: records });
}

export async function getStudentRecords(req: Request, res: Response) {
  const studentId = await resolveStudentId(req.params.studentId, req.user?.userId);
  const records = await attendanceService.getStudentRecords(studentId);
  res.json({ data: records });
}

export async function getStudentSummary(req: Request, res: Response) {
  const studentId = await resolveStudentId(req.params.studentId, req.user?.userId);
  const summary = await attendanceService.getStudentSummary(studentId);
  res.json({ data: summary });
}
