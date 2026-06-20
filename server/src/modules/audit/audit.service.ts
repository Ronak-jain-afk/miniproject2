import mongoose from 'mongoose';

export async function createAuditLog(params: {
  actor: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'import' | 'export';
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}) {
  const { AuditLog } = await import('./audit.model');
  return AuditLog.create(params);
}

export async function getAuditLogs(query: {
  page: number;
  limit: number;
  actor?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { AuditLog } = await import('./audit.model');
  const filter: any = {};
  if (query.actor) filter.actor = new mongoose.Types.ObjectId(query.actor);
  if (query.action) filter.action = query.action;
  if (query.resource) filter.resource = query.resource;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const skip = (query.page - 1) * query.limit;
  const [data, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).populate('actor', 'email profile'),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}
