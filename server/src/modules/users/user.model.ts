import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  status: 'active' | 'locked' | 'disabled';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    status: { type: String, enum: ['active', 'locked', 'disabled'], default: 'active' },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      avatar: { type: String },
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
