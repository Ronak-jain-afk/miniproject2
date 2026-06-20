import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendanceRule extends Document {
  department?: Types.ObjectId;
  semester?: Types.ObjectId;
  minimumPercentage: number;
  lateCountsAsPresent: boolean;
  excusedCountsAsPresent: boolean;
  freezePeriodHours: number;
  warningThresholds: number[];
  consecutiveAbsenceLimit: number;
}

const attendanceRuleSchema = new Schema<IAttendanceRule>(
  {
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester' },
    minimumPercentage: { type: Number, default: 75, min: 0, max: 100 },
    lateCountsAsPresent: { type: Boolean, default: false },
    excusedCountsAsPresent: { type: Boolean, default: true },
    freezePeriodHours: { type: Number, default: 24, min: 1 },
    warningThresholds: { type: [Number], default: [75, 65, 50] },
    consecutiveAbsenceLimit: { type: Number, default: 5, min: 1 },
  },
  { timestamps: true }
);

attendanceRuleSchema.index({ department: 1, semester: 1 }, { unique: true, sparse: true });

export const AttendanceRule = mongoose.model<IAttendanceRule>('AttendanceRule', attendanceRuleSchema);
