import { Request, Response } from 'express';
import * as subjectService from './subject.service';

export async function getAll(req: Request, res: Response) {
  const result = await subjectService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const subj = await subjectService.getById(req.params.id);
  res.json({ data: subj });
}

export async function create(req: Request, res: Response) {
  const subj = await subjectService.create(req.body);
  res.status(201).json({ data: subj });
}

export async function update(req: Request, res: Response) {
  const subj = await subjectService.update(req.params.id, req.body);
  res.json({ data: subj });
}

export async function remove(req: Request, res: Response) {
  const subj = await subjectService.remove(req.params.id);
  res.json({ data: subj });
}

export async function assignFaculty(req: Request, res: Response) {
  const subj = await subjectService.assignFaculty(req.params.id, req.body.facultyId);
  res.json({ data: subj });
}

export async function removeFaculty(req: Request, res: Response) {
  const subj = await subjectService.removeFaculty(req.params.id, req.params.facultyId);
  res.json({ data: subj });
}
