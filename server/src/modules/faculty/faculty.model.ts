import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFaculty extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  department: Types.ObjectId;
  subjects: Types.ObjectId[];
  joiningDate?: Date;
  qualification?: string;
  specialization?: string;
}

const facultySchema = new Schema<IFaculty>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    joiningDate: { type: Date },
    qualification: { type: String, trim: true },
    specialization: { type: String, trim: true },
  },
  { timestamps: true }
);

facultySchema.index({ department: 1 });
facultySchema.index({ subjects: 1 });

export const Faculty = mongoose.model<IFaculty>('Faculty', facultySchema);
