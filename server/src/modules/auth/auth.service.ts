import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/user.model';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterInput, LoginInput } from './auth.validation';

const BCRYPT_COST = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);

  const user = await User.create({
    email: input.email,
    password: hashedPassword,
    role: input.role,
    profile: input.profile,
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === 'disabled') {
    throw new AppError('Account is disabled. Contact administrator.', 403);
  }

  if (user.status === 'locked' && user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('Account is locked. Try again later.', 423);
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.status = 'locked';
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await user.save();
    throw new AppError('Invalid email or password', 401);
  }

  user.loginAttempts = 0;
  user.status = 'active';
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken();
  user.refreshToken = await bcrypt.hash(refreshToken, 10);

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  };
}

export async function refresh(refreshToken: string) {
  const users = await User.find({ refreshToken: { $exists: true } });

  let matchedUser = null;
  for (const user of users) {
    if (user.refreshToken && (await bcrypt.compare(refreshToken, user.refreshToken))) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new AppError('Invalid refresh token', 401);
  }

  const newAccessToken = generateAccessToken(matchedUser._id.toString(), matchedUser.role);
  const newRefreshToken = generateRefreshToken();
  matchedUser.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await matchedUser.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
}
