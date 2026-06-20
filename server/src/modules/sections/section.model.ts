import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISection extends Document {
  name: string;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  isActive: boolean;
}

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, trim: true, uppercase: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sectionSchema.index({ semester: 1, name: 1 }, { unique: true });

export const Section = mongoose.model<ISection>('Section', sectionSchema);
