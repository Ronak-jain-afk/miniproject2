import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: Types.ObjectId;
  semester: Types.ObjectId;
  credits: number;
  faculty: Types.ObjectId[];
  isActive: boolean;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    faculty: [{ type: Schema.Types.ObjectId, ref: 'Faculty' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ department: 1 });
subjectSchema.index({ semester: 1 });
subjectSchema.index({ faculty: 1 });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
