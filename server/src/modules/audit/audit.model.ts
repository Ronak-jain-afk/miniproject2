import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actor: Schema.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'import' | 'export';
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['create', 'update', 'delete', 'login', 'logout', 'import', 'export'], required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
