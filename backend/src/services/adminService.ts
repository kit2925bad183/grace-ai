import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import {
  User,
  Department,
  Grievance,
  Officer,
  AuditLog,
  DuplicateMatch,
  SLAPrediction,
  Notification,
  SecurityEvent,
  AIAnalysis,
} from '../models';
import { UserRole, UserStatus, GrievanceStatus } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { getAuthorityOverview } from './analyticsOverview';
import { validatePasswordStrength, validateAdminPasswordStrength, verifyAdminPassword } from './authService';
import { writeSecurityEvent } from './securityService';
import { writeAuditLog } from './auditService';
import type { Request } from 'express';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateHeadInput,
  CreateDepartmentUserInput,
} from '../validators/adminValidators';

const BCRYPT_ROUNDS = 12;
const RESOLVED = [GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED];

function notDeletedFilter(includeDeleted?: boolean) {
  return includeDeleted ? {} : { isDeleted: { $ne: true } };
}

function sanitizeUser(user: Record<string, unknown> | object) {
  const record = user as Record<string, unknown>;
  const {
    passwordHash,
    refreshTokenHash,
    emailVerificationTokenHash,
    passwordResetTokenHash,
    twoFactorSecretEncrypted,
    recoveryCodesHash,
    ...safe
  } = record;
  void passwordHash;
  void refreshTokenHash;
  void emailVerificationTokenHash;
  void passwordResetTokenHash;
  void twoFactorSecretEncrypted;
  void recoveryCodesHash;
  return safe;
}

async function hashPassword(password: string): Promise<string> {
  validatePasswordStrength(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function getPlatformStats() {
  const [
    totalCitizens,
    totalDepartments,
    departmentHeads,
    departmentUsers,
    totalAdmins,
    totalUsers,
    overview,
    suspendedUsers,
    slaBreached,
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.CITIZEN, ...notDeletedFilter() }),
    Department.countDocuments({ active: true }),
    User.countDocuments({ role: UserRole.HEAD_OF_DEPARTMENTS, status: UserStatus.ACTIVE, ...notDeletedFilter() }),
    User.countDocuments({ role: UserRole.DEPARTMENT, status: UserStatus.ACTIVE, ...notDeletedFilter() }),
    User.countDocuments({ role: UserRole.ADMIN, ...notDeletedFilter() }),
    User.countDocuments(notDeletedFilter()),
    getAuthorityOverview(),
    User.countDocuments({ status: { $in: [UserStatus.SUSPENDED, UserStatus.DISABLED] }, ...notDeletedFilter() }),
    Grievance.countDocuments({
      slaDeadline: { $lt: new Date() },
      status: { $nin: RESOLVED },
    }),
  ]);

  const criticalComplaints = await Grievance.countDocuments({
    priority: 'CRITICAL',
    status: { $nin: RESOLVED },
  });

  return {
    totalUsers,
    totalCitizens,
    totalDepartments,
    departmentHeads,
    departmentUsers,
    totalAdmins,
    totalComplaints: overview.totalGrievances,
    activeComplaints: overview.inProgress,
    resolvedComplaints: overview.resolved,
    slaCompliance: overview.slaCompliance,
    slaAtRisk: overview.slaAtRisk,
    slaBreached,
    criticalComplaints,
    duplicateClusters: overview.duplicateComplaints,
    suspendedUsers,
    attentionRequired: overview.attentionRequired,
    attentionQueue: overview.attentionQueue,
    averageResolutionTime: overview.averageResolutionTime,
  };
}

export async function listDepartments(): Promise<Array<Record<string, unknown>>> {
  const departments = await Department.find().sort({ name: 1 }).lean();
  const stats = await Promise.all(
    departments.map(async (dept) => {
      const deptId = dept._id;
      const [total, pending, resolved, staff, head] = await Promise.all([
        Grievance.countDocuments({ departmentId: deptId }),
        Grievance.countDocuments({ departmentId: deptId, status: { $nin: RESOLVED } }),
        Grievance.countDocuments({ departmentId: deptId, status: { $in: RESOLVED } }),
        User.countDocuments({ departmentId: deptId, role: UserRole.DEPARTMENT }),
        User.findOne({ role: UserRole.HEAD_OF_DEPARTMENTS }).select('name email').lean(),
      ]);
      return { ...dept, stats: { total, pending, resolved, staff, head } };
    })
  );
  return stats;
}

export async function getDepartmentById(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Department not found', 404);
  const department = await Department.findById(id).lean();
  if (!department) throw new AppError('Department not found', 404);

  const deptId = department._id;
  const [total, pending, resolved, staff, officers, recent, users] = await Promise.all([
    Grievance.countDocuments({ departmentId: deptId }),
    Grievance.countDocuments({ departmentId: deptId, status: { $nin: RESOLVED } }),
    Grievance.countDocuments({ departmentId: deptId, status: { $in: RESOLVED } }),
    User.countDocuments({ departmentId: deptId, role: UserRole.DEPARTMENT }),
    Officer.countDocuments({ departmentId: deptId, active: true }),
    Grievance.find({ departmentId: deptId }).sort({ createdAt: -1 }).limit(5).select('grievanceId title status priority createdAt').lean(),
    User.find({ departmentId: deptId, role: UserRole.DEPARTMENT }).select('-passwordHash').lean(),
  ]);

  return {
    department,
    stats: { total, pending, resolved, staff, officers },
    recentComplaints: recent,
    users: users.map(sanitizeUser),
  };
}

export async function createDepartment(input: CreateDepartmentInput, adminId: string, req?: Request) {
  const existing = await Department.findOne({ code: input.code.toUpperCase() });
  if (existing) throw new AppError('Department code already exists', 409);

  const department = await Department.create({
    ...input,
    code: input.code.toUpperCase(),
    createdBy: adminId,
  });

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_CREATED_DEPARTMENT',
    resourceType: 'Department',
    resourceId: department._id.toString(),
    newValue: { name: department.name, code: department.code },
    req,
  });

  return department;
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput,
  adminId: string,
  req?: Request
) {
  const department = await Department.findById(id);
  if (!department) throw new AppError('Department not found', 404);

  if (input.code) {
    const dup = await Department.findOne({ code: input.code.toUpperCase(), _id: { $ne: id } });
    if (dup) throw new AppError('Department code already exists', 409);
    input.code = input.code.toUpperCase();
  }

  const oldValue = { name: department.name, code: department.code, active: department.active };
  Object.assign(department, input);
  await department.save();

  await writeAuditLog({
    userId: adminId,
    action: input.active === false ? 'ADMIN_DEACTIVATED_DEPARTMENT' : 'ADMIN_UPDATED_DEPARTMENT',
    resourceType: 'Department',
    resourceId: id,
    oldValue,
    newValue: { name: department.name, code: department.code, active: department.active },
    req,
  });

  return department;
}

export async function createHead(input: CreateHeadInput, adminId: string, req?: Request) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new AppError('Email already exists', 409);

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    employeeCode: input.employeeCode,
    designation: input.designation,
    passwordHash,
    role: UserRole.HEAD_OF_DEPARTMENTS,
    status: input.status ?? UserStatus.ACTIVE,
    emailVerified: true,
    isActive: true,
  });

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_CREATED_HEAD',
    resourceType: 'User',
    resourceId: user._id.toString(),
    newValue: { email: user.email, role: user.role },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function createDepartmentUser(
  input: CreateDepartmentUserInput,
  adminId: string,
  req?: Request
) {
  const department = await Department.findById(input.departmentId);
  if (!department || !department.active) throw new AppError('Department not found or inactive', 404);

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new AppError('Email already exists', 409);

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    employeeCode: input.employeeCode,
    designation: input.designation,
    passwordHash,
    role: UserRole.DEPARTMENT,
    departmentId: department._id,
    status: input.status ?? UserStatus.ACTIVE,
    emailVerified: true,
    isActive: true,
  });

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_CREATED_DEPARTMENT_USER',
    resourceType: 'User',
    resourceId: user._id.toString(),
    newValue: { email: user.email, departmentId: department._id.toString() },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function listUsers(filters: {
  role?: string;
  status?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { ...notDeletedFilter(filters.includeDeleted) };

  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash -refreshTokenHash')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items: items.map(sanitizeUser),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function listHeads() {
  const heads = await User.find({ role: UserRole.HEAD_OF_DEPARTMENTS })
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean();
  return heads.map(sanitizeUser);
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  adminId: string,
  req?: Request
) {
  if (userId === adminId) throw new AppError('Cannot change your own account status', 403);
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === UserRole.ADMIN) throw new AppError('Cannot suspend another admin via this endpoint', 403);

  const oldStatus = user.status;
  user.status = status;
  user.isActive = status === UserStatus.ACTIVE;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: status === UserStatus.ACTIVE ? 'ADMIN_ACTIVATED_USER' : 'ADMIN_SUSPENDED_USER',
    resourceType: 'User',
    resourceId: userId,
    oldValue: { status: oldStatus },
    newValue: { status },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function changeUserRole(
  userId: string,
  role: UserRole,
  departmentId: string | undefined,
  adminId: string,
  req?: Request
) {
  if (userId === adminId) throw new AppError('Cannot change your own role', 403);
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (role === UserRole.DEPARTMENT && !departmentId) {
    throw new AppError('Department is required for department users', 422);
  }
  if (role === UserRole.DEPARTMENT && departmentId) {
    const dept = await Department.findById(departmentId);
    if (!dept) throw new AppError('Department not found', 404);
    user.departmentId = dept._id;
  } else {
    user.departmentId = undefined;
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_CHANGED_ROLE',
    resourceType: 'User',
    resourceId: userId,
    oldValue: { role: oldRole },
    newValue: { role, departmentId },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function listAuditLogs(filters: {
  action?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 30));
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};
  if (filters.action) query.action = filters.action;

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getPlatformHealth() {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  return {
    backend: { status: 'healthy', label: 'Backend API' },
    mongodb: { status: dbStatus === 'connected' ? 'healthy' : 'degraded', label: 'MongoDB', detail: dbStatus },
    authentication: { status: 'healthy', label: 'Authentication' },
    ai: { status: 'healthy', label: 'AI Service' },
    analytics: { status: 'healthy', label: 'Analytics Service' },
    notifications: { status: 'healthy', label: 'Notification Service' },
  };
}

export async function getSystemActivity() {
  const [latestUser, latestDept, latestGrievance, latestAudit, counts, securityEvents, aiAnalyses] =
    await Promise.all([
      User.findOne().sort({ createdAt: -1 }).select('name email role createdAt').lean(),
      Department.findOne().sort({ createdAt: -1 }).select('name code createdAt').lean(),
      Grievance.findOne().sort({ createdAt: -1 }).select('grievanceId title createdAt').lean(),
      AuditLog.findOne().sort({ createdAt: -1 }).populate('userId', 'name').lean(),
      Promise.all([
        User.countDocuments(notDeletedFilter()),
        Department.countDocuments(),
        Grievance.countDocuments(),
        Notification.countDocuments(),
        DuplicateMatch.countDocuments(),
        SLAPrediction.countDocuments(),
        AuditLog.countDocuments(),
      ]),
      SecurityEvent.countDocuments(),
      AIAnalysis.countDocuments(),
    ]);

  return {
    latestUser,
    latestDepartment: latestDept,
    latestGrievance,
    latestAudit,
    recordCounts: {
      users: counts[0],
      departments: counts[1],
      grievances: counts[2],
      notifications: counts[3],
      duplicates: counts[4],
      slaPredictions: counts[5],
      auditLogs: counts[6],
      securityEvents,
      aiAnalyses,
    },
  };
}

export async function getUserById(userId: string) {
  if (!mongoose.isValidObjectId(userId)) throw new AppError('User not found', 404);
  const user = await User.findById(userId)
    .select('-passwordHash -refreshTokenHash -twoFactorSecretEncrypted -recoveryCodesHash')
    .populate('departmentId', 'name code')
    .lean();
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

export async function updateUser(
  userId: string,
  input: { name?: string; phone?: string; employeeCode?: string; designation?: string; departmentId?: string },
  adminId: string,
  req?: Request
) {
  if (userId === adminId) throw new AppError('Use profile settings to update your own account', 403);
  const user = await User.findById(userId);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);

  const oldValue = {
    name: user.name,
    phone: user.phone,
    employeeCode: user.employeeCode,
    designation: user.designation,
    departmentId: user.departmentId?.toString(),
  };

  if (input.name) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone || undefined;
  if (input.employeeCode !== undefined) user.employeeCode = input.employeeCode || undefined;
  if (input.designation !== undefined) user.designation = input.designation || undefined;
  if (input.departmentId && user.role === UserRole.DEPARTMENT) {
    const dept = await Department.findById(input.departmentId);
    if (!dept) throw new AppError('Department not found', 404);
    user.departmentId = dept._id;
  }

  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_UPDATED_USER',
    resourceType: 'User',
    resourceId: userId,
    oldValue,
    newValue: input as Record<string, unknown>,
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function softDeleteUser(
  userId: string,
  reason: string | undefined,
  adminId: string,
  req?: Request
) {
  if (userId === adminId) throw new AppError('Cannot delete your own account', 403);
  const user = await User.findById(userId);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);
  if (user.role === UserRole.ADMIN) {
    throw new AppError('Use permanent delete with re-authentication for admin accounts', 403);
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = new mongoose.Types.ObjectId(adminId);
  user.deletedReason = reason;
  user.status = UserStatus.DISABLED;
  user.isActive = false;
  user.refreshTokenHash = undefined;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_SOFT_DELETED_USER',
    resourceType: 'User',
    resourceId: userId,
    newValue: { reason },
    req,
  });

  await writeSecurityEvent({
    userId: adminId,
    eventType: 'ADMIN_ACTION',
    severity: 'HIGH',
    metadata: { action: 'soft_delete_user', targetUserId: userId },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function restoreUser(userId: string, adminId: string, req?: Request) {
  const user = await User.findById(userId);
  if (!user || !user.isDeleted) throw new AppError('Deleted user not found', 404);

  user.isDeleted = false;
  user.deletedAt = undefined;
  user.deletedBy = undefined;
  user.deletedReason = undefined;
  user.status = UserStatus.ACTIVE;
  user.isActive = true;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_RESTORED_USER',
    resourceType: 'User',
    resourceId: userId,
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function permanentDeleteUser(
  userId: string,
  adminId: string,
  adminPassword: string,
  confirmation: string,
  req?: Request
) {
  if (confirmation !== 'DELETE USER') {
    throw new AppError('Type DELETE USER to confirm permanent deletion', 400);
  }
  await verifyAdminPassword(adminId, adminPassword);
  if (userId === adminId) throw new AppError('Cannot permanently delete your own account', 403);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (user.role === UserRole.ADMIN) {
    const adminCount = await User.countDocuments({ role: UserRole.ADMIN, isDeleted: { $ne: true } });
    if (adminCount <= 1) throw new AppError('Cannot delete the last admin account', 403);
  }

  const grievanceCount = await Grievance.countDocuments({ citizenId: user._id });
  if (grievanceCount > 0) {
    throw new AppError('User has historical complaints. Use soft delete to preserve records.', 409);
  }

  await User.deleteOne({ _id: userId });

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_PERMANENTLY_DELETED_USER',
    resourceType: 'User',
    resourceId: userId,
    oldValue: { email: user.email, role: user.role },
    req,
  });

  return { deleted: true };
}

export async function forceLogoutUser(userId: string, adminId: string, req?: Request) {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);

  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.refreshTokenHash = undefined;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_FORCE_LOGOUT',
    resourceType: 'User',
    resourceId: userId,
    req,
  });

  await writeSecurityEvent({
    userId,
    eventType: 'SESSION_REVOKED',
    severity: 'HIGH',
    metadata: { revokedBy: adminId },
    req,
  });

  return { message: 'All sessions revoked for this user.' };
}

export async function adminResetPassword(
  userId: string,
  newPassword: string,
  adminId: string,
  req?: Request
) {
  validatePasswordStrength(newPassword);
  const user = await User.findById(userId);
  if (!user || user.isDeleted) throw new AppError('User not found', 404);

  user.passwordHash = await hashPassword(newPassword);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.refreshTokenHash = undefined;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_RESET_PASSWORD',
    resourceType: 'User',
    resourceId: userId,
    req,
  });

  await writeSecurityEvent({
    userId,
    eventType: 'PASSWORD_CHANGED',
    severity: 'HIGH',
    metadata: { resetByAdmin: adminId },
    req,
  });

  return { message: 'Password reset successfully.' };
}

export async function unlockUser(userId: string, adminId: string, req?: Request) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_UNLOCKED_USER',
    resourceType: 'User',
    resourceId: userId,
    req,
  });

  await writeSecurityEvent({ userId, eventType: 'ACCOUNT_UNLOCKED', req });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function verifyUserEmail(userId: string, adminId: string, req?: Request) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_VERIFIED_EMAIL',
    resourceType: 'User',
    resourceId: userId,
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function createAdminUser(
  input: CreateHeadInput,
  adminId: string,
  adminPassword: string,
  req?: Request
) {
  await verifyAdminPassword(adminId, adminPassword);
  validateAdminPasswordStrength(input.password);

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new AppError('Email already exists', 409);

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    employeeCode: input.employeeCode,
    designation: input.designation ?? 'Platform Administrator',
    passwordHash,
    role: UserRole.ADMIN,
    status: input.status ?? UserStatus.ACTIVE,
    emailVerified: true,
    isActive: true,
    createdBy: adminId,
  });

  await writeAuditLog({
    userId: adminId,
    action: 'ADMIN_CREATED_ADMIN',
    resourceType: 'User',
    resourceId: user._id.toString(),
    newValue: { email: user.email },
    req,
  });

  await writeSecurityEvent({
    userId: adminId,
    eventType: 'ADMIN_ACTION',
    severity: 'CRITICAL',
    metadata: { action: 'create_admin', newAdminId: user._id.toString() },
    req,
  });

  return sanitizeUser(user.toObject() as unknown as Record<string, unknown>);
}

export async function globalSearch(query: string, page = 1, limit = 20) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return { users: [], grievances: [], departments: [], pagination: { page, limit, total: 0 } };
  }

  const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [users, grievances, departments] = await Promise.all([
    User.find({
      ...notDeletedFilter(),
      $or: [{ name: regex }, { email: regex }, { employeeCode: regex }],
    })
      .select('name email role status')
      .limit(5)
      .lean(),
    Grievance.find({
      $or: [{ grievanceId: regex }, { title: regex }, { description: regex }],
    })
      .select('grievanceId title status priority createdAt')
      .limit(8)
      .lean(),
    Department.find({ $or: [{ name: regex }, { code: regex }] })
      .select('name code active')
      .limit(5)
      .lean(),
  ]);

  return {
    users: users.map(sanitizeUser),
    grievances,
    departments,
    pagination: { page, limit, total: users.length + grievances.length + departments.length },
  };
}

export async function bootstrapAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
  if (existingAdmin) {
    throw new AppError('An admin account already exists. Bootstrap refused.', 409);
  }

  const passwordHash = await hashPassword(input.password);
  await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    isActive: true,
  });
}
