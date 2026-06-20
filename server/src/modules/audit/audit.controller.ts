import { Request, Response } from 'express';
import * as auditService from './audit.service';

export async function listAuditLogs(req: Request, res: Response) {
  const { page = '1', limit = '50', actor, action, resource, startDate, endDate } = req.query as any;
  const result = await auditService.getAuditLogs({
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    actor: actor as string,
    action: action as string,
    resource: resource as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  res.json(result);
}
