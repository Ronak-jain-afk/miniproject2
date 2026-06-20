import { Request, Response } from 'express';
import * as reportsService from './reports.service';

export async function studentReport(req: Request, res: Response) {
  try {
    const pdf = await reportsService.generateStudentReport(req.params.studentId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=student-report-${req.params.studentId}.pdf`);
    res.send(pdf);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function subjectReport(req: Request, res: Response) {
  try {
    const pdf = await reportsService.generateSubjectReport(req.params.subjectId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=subject-report-${req.params.subjectId}.pdf`);
    res.send(pdf);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function defaultersReport(req: Request, res: Response) {
  const pdf = await reportsService.generateDefaulterReport();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=defaulters-list.pdf');
  res.send(pdf);
}
