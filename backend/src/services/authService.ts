import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { toAuthUser, AuthUser } from '../middleware/authMiddleware';
import { signToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validators/authValidators';

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: toAuthUser(user),
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: UserRole.CITIZEN,
    phone: input.phone,
  });

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: toAuthUser(user),
  };
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Authentication required', 401);
  }
  return toAuthUser(user);
}

export function logoutUser(): { message: string } {
  return { message: 'Logged out successfully. Please remove the token on the client.' };
}
