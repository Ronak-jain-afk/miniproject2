import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISemester extends Document {
  name: string;
  number: number;
  course: Types.ObjectId;
  isActive: boolean;
}

const semesterSchema = new Schema<ISemester>(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true, min: 1, max: 12 },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

semesterSchema.index({ course: 1, number: 1 }, { unique: true });

export const Semester = mongoose.model<ISemester>('Semester', semesterSchema);
