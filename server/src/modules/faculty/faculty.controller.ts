import { Request, Response } from 'express';
import * as facultyService from './faculty.service';

export async function getAll(req: Request, res: Response) {
  const result = await facultyService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const faculty = await facultyService.getById(req.params.id);
  res.json({ data: faculty });
}

export async function create(req: Request, res: Response) {
  const faculty = await facultyService.create(req.body);
  res.status(201).json({ data: faculty });
}

export async function update(req: Request, res: Response) {
  const faculty = await facultyService.update(req.params.id, req.body);
  res.json({ data: faculty });
}

export async function getAssignedSubjects(req: Request, res: Response) {
  const subjects = await facultyService.getAssignedSubjects(req.params.id);
  res.json({ data: subjects });
}

export async function getWorkload(req: Request, res: Response) {
  const workload = await facultyService.getWorkload(req.params.id);
  res.json({ data: workload });
}
