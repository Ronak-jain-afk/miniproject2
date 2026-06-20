import { Request, Response } from 'express';
import * as sectionService from './section.service';

export async function getAll(req: Request, res: Response) {
  const result = await sectionService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const section = await sectionService.getById(req.params.id);
  res.json({ data: section });
}

export async function create(req: Request, res: Response) {
  const section = await sectionService.create(req.body);
  res.status(201).json({ data: section });
}

export async function update(req: Request, res: Response) {
  const section = await sectionService.update(req.params.id, req.body);
  res.json({ data: section });
}

export async function remove(req: Request, res: Response) {
  const section = await sectionService.remove(req.params.id);
  res.json({ data: section });
}
