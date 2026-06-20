import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  session: Types.ObjectId;
  student: Types.ObjectId;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: Types.ObjectId;
  modifiedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    modifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });
attendanceRecordSchema.index({ student: 1, createdAt: -1 });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', attendanceRecordSchema);
