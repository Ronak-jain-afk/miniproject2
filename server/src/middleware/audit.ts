import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from '../modules/audit/audit.service';

export function audit(action: 'create' | 'update' | 'delete' | 'import' | 'export', resource: string, extractId?: (req: Request) => string | undefined) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const originalSend = _res.json.bind(_res);
    _res.json = function (body: any) {
      if (_res.statusCode < 400) {
        const actor = (req as any).user?.id;
        if (actor) {
          const resourceId = extractId ? extractId(req) : req.params?.id || body?._id || body?.data?._id;
          const details = req.method === 'DELETE' ? undefined : JSON.stringify({ body: req.body, query: req.query });
          createAuditLog({
            actor,
            action,
            resource,
            resourceId,
            details,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          }).catch(() => {});
        }
      }
      return originalSend(body);
    };
    next();
  };
}
