import { Request, Response } from 'express';
import * as studentService from './student.service';

export async function getAll(req: Request, res: Response) {
  const result = await studentService.list(req.query as any);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const student = await studentService.getById(req.params.id);
  res.json({ data: student });
}

export async function create(req: Request, res: Response) {
  const student = await studentService.create(req.body);
  res.status(201).json({ data: student });
}

export async function update(req: Request, res: Response) {
  const student = await studentService.update(req.params.id, req.body);
  res.json({ data: student });
}

export async function updateStatus(req: Request, res: Response) {
  const student = await studentService.updateStatus(req.params.id, req.body.status);
  res.json({ data: student });
}
