import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISession extends Document {
  subject: Types.ObjectId;
  section: Types.ObjectId;
  faculty: Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime?: Date;
  totalStudents: number;
  status: 'active' | 'completed' | 'locked';
}

const sessionSchema = new Schema<ISession>(
  {
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    totalStudents: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'locked'], default: 'active' },
  },
  { timestamps: true }
);

sessionSchema.index({ subject: 1, section: 1, faculty: 1, date: 1 }, { unique: true });
sessionSchema.index({ faculty: 1, date: -1 });
sessionSchema.index({ status: 1, createdAt: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
