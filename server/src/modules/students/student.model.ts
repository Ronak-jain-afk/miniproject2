import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId: Types.ObjectId;
  rollNumber: string;
  registrationNumber: string;
  department: Types.ObjectId;
  course: Types.ObjectId;
  currentSemester: Types.ObjectId;
  section: Types.ObjectId;
  admissionYear: number;
  status: 'active' | 'graduated' | 'suspended' | 'discontinued';
}

const studentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    currentSemester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    admissionYear: { type: Number, required: true },
    status: { type: String, enum: ['active', 'graduated', 'suspended', 'discontinued'], default: 'active' },
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, course: 1, currentSemester: 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
