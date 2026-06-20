import { Request, Response } from 'express';
import * as semesterService from './semester.service';

export async function getAll(req: Request, res: Response) {
  const result = await semesterService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const sem = await semesterService.getById(req.params.id);
  res.json({ data: sem });
}

export async function create(req: Request, res: Response) {
  const sem = await semesterService.create(req.body);
  res.status(201).json({ data: sem });
}

export async function update(req: Request, res: Response) {
  const sem = await semesterService.update(req.params.id, req.body);
  res.json({ data: sem });
}

export async function remove(req: Request, res: Response) {
  const sem = await semesterService.remove(req.params.id);
  res.json({ data: sem });
}
