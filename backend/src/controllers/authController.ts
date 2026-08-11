import { Request, Response, NextFunction } from 'express';
import {
  loginUser,
  registerUser,
  getUserById,
  logoutUser,
} from '../services/authService';

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await getUserById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = logoutUser();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
