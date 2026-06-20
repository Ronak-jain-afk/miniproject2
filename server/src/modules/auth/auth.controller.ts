import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json({ data: result });
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ data: result });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.user!.userId);
  res.json({ message: 'Logged out successfully.' });
}

export async function getMe(req: Request, res: Response) {
  const { User } = await import('../users/user.model');
  const user = await User.findById(req.user!.userId).select('-password -refreshToken');
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ data: user });
}
