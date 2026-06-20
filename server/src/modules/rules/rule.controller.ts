import { Request, Response } from 'express';
import * as ruleService from './rule.service';

export async function getAll(req: Request, res: Response) {
  const result = await ruleService.list();
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const rule = await ruleService.getById(req.params.id);
  res.json({ data: rule });
}

export async function create(req: Request, res: Response) {
  const rule = await ruleService.create(req.body);
  res.status(201).json({ data: rule });
}

export async function update(req: Request, res: Response) {
  const rule = await ruleService.update(req.params.id, req.body);
  res.json({ data: rule });
}

export async function remove(req: Request, res: Response) {
  const rule = await ruleService.remove(req.params.id);
  res.json({ data: rule });
}
