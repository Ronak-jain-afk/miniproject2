import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { Faculty } from '../faculty/faculty.model';
import { Student } from '../students/student.model';

export async function facultyDashboard(req: Request, res: Response) {
  const faculty = await Faculty.findOne({ userId: req.user!.userId });
  if (!faculty) { res.status(404).json({ error: 'Faculty profile not found' }); return; }
  const data = await analyticsService.facultyDashboard(faculty._id.toString());
  res.json({ data });
}

export async function studentDashboard(req: Request, res: Response) {
  const student = await Student.findOne({ userId: req.user!.userId });
  if (!student) { res.status(404).json({ error: 'Student profile not found' }); return; }
  const data = await analyticsService.studentDashboard(student._id.toString());
  res.json({ data });
}

export async function adminDashboard(req: Request, res: Response) {
  const data = await analyticsService.adminDashboard();
  res.json({ data });
}

export async function lowAttendance(req: Request, res: Response) {
  const data = await analyticsService.lowAttendance(req.query as any);
  res.json({ data });
}

export async function attendanceTrends(req: Request, res: Response) {
  const days = parseInt(req.query.days as string) || 30;
  const data = await analyticsService.attendanceTrends(days);
  res.json({ data });
}

export async function departmentWise(req: Request, res: Response) {
  const data = await analyticsService.departmentWise();
  res.json({ data });
}
