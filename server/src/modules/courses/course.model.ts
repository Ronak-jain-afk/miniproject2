import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  department: Types.ObjectId;
  duration: number;
  isActive: boolean;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    duration: { type: Number, required: true, min: 1, max: 6 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ department: 1 });
courseSchema.index({ department: 1, name: 1 }, { unique: true });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
