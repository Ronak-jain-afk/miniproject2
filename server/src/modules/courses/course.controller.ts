import { Request, Response } from 'express';
import * as courseService from './course.service';

export async function getAll(req: Request, res: Response) {
  const result = await courseService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const course = await courseService.getById(req.params.id);
  res.json({ data: course });
}

export async function create(req: Request, res: Response) {
  const course = await courseService.create(req.body);
  res.status(201).json({ data: course });
}

export async function update(req: Request, res: Response) {
  const course = await courseService.update(req.params.id, req.body);
  res.json({ data: course });
}

export async function remove(req: Request, res: Response) {
  const course = await courseService.remove(req.params.id);
  res.json({ data: course });
}
