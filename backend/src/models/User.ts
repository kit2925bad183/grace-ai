import mongoose, { Document, Schema, Types } from 'mongoose';
import { AuthProvider, UserRole, UserStatus } from './enums';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  departmentId?: Types.ObjectId;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  avatar?: string;
  googleId?: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
  status: UserStatus;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  refreshTokenHash?: string;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  tokenVersion: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deletedReason?: string;
  createdBy?: Types.ObjectId;
  twoFactorEnabled: boolean;
  twoFactorSecretEncrypted?: string;
  recoveryCodesHash?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Role is required'],
      default: UserRole.CITIZEN,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    employeeCode: {
      type: String,
      trim: true,
      maxlength: 40,
      sparse: true,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    avatar: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      trim: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedReason: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecretEncrypted: {
      type: String,
      select: false,
    },
    recoveryCodesHash: {
      type: [String],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('validate', function (next) {
  if (this.isDeleted) {
    this.isActive = false;
  }
  if (this.role === UserRole.DEPARTMENT && !this.departmentId) {
    next(new Error('Department users must have a departmentId'));
    return;
  }
  if (this.role === UserRole.CITIZEN && this.departmentId) {
    this.departmentId = undefined;
  }
  if (this.role === UserRole.HEAD_OF_DEPARTMENTS && this.departmentId) {
    this.departmentId = undefined;
  }
  if (this.role === UserRole.ADMIN && this.departmentId) {
    this.departmentId = undefined;
  }
  this.isActive = this.status === UserStatus.ACTIVE;
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
