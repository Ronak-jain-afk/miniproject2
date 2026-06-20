import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: 'low_attendance' | 'session_reminder' | 'attendance_marked' | 'threshold_alert' | 'info';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['low_attendance', 'session_reminder', 'attendance_marked', 'threshold_alert', 'info'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
