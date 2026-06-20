import { Request, Response } from 'express';
import * as departmentService from './department.service';

export async function getAll(req: Request, res: Response) {
  const result = await departmentService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const dept = await departmentService.getById(req.params.id);
  res.json({ data: dept });
}

export async function create(req: Request, res: Response) {
  const dept = await departmentService.create(req.body);
  res.status(201).json({ data: dept });
}

export async function update(req: Request, res: Response) {
  const dept = await departmentService.update(req.params.id, req.body);
  res.json({ data: dept });
}

export async function remove(req: Request, res: Response) {
  const dept = await departmentService.remove(req.params.id);
  res.json({ data: dept });
}
