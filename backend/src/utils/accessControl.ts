import { Types } from 'mongoose';
import { UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import type { AuthUser } from '../middleware/authMiddleware';

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function isHead(role: UserRole): boolean {
  return role === UserRole.HEAD_OF_DEPARTMENTS;
}

export function isHeadOrAdmin(role: UserRole): boolean {
  return role === UserRole.HEAD_OF_DEPARTMENTS || role === UserRole.ADMIN;
}

export function isDepartment(role: UserRole): boolean {
  return role === UserRole.DEPARTMENT;
}

export function isCitizen(role: UserRole): boolean {
  return role === UserRole.CITIZEN;
}

export interface AccessContext {
  id: string;
  role: UserRole;
  departmentId?: string;
}

export function requireDepartmentIdFromContext(ctx: AccessContext): string {
  if (ctx.role !== UserRole.DEPARTMENT) {
    throw new AppError('Department account required', 403);
  }
  if (!ctx.departmentId) {
    throw new AppError('Department account is not linked to a department', 403);
  }
  return ctx.departmentId;
}

export function assertGrievanceAccess(
  grievance: { citizenId: Types.ObjectId; departmentId: Types.ObjectId },
  ctx: AccessContext
): void {
  if (isHeadOrAdmin(ctx.role)) {
    return;
  }

  if (ctx.role === UserRole.DEPARTMENT) {
    const departmentId = requireDepartmentIdFromContext(ctx);
    if (!grievance.departmentId.equals(departmentId)) {
      throw new AppError('You do not have permission to access this complaint', 403);
    }
    return;
  }

  if (ctx.role === UserRole.CITIZEN && !grievance.citizenId.equals(ctx.id)) {
    throw new AppError('You do not have permission to view this complaint', 403);
  }
}

export function canManageGrievance(ctx: AccessContext): boolean {
  return ctx.role === UserRole.DEPARTMENT || isHeadOrAdmin(ctx.role);
}

export function assertCanManageGrievance(
  grievance: { departmentId: Types.ObjectId },
  ctx: AccessContext
): void {
  if (isHeadOrAdmin(ctx.role)) {
    return;
  }

  if (ctx.role === UserRole.DEPARTMENT) {
    const departmentId = requireDepartmentIdFromContext(ctx);
    if (!grievance.departmentId.equals(departmentId)) {
      throw new AppError('Insufficient permissions for this department', 403);
    }
    return;
  }

  throw new AppError('Insufficient permissions', 403);
}

export function resolveDepartmentScope(
  ctx: AccessContext,
  requestedDepartmentId?: string
): string | undefined {
  if (ctx.role === UserRole.DEPARTMENT) {
    return requireDepartmentIdFromContext(ctx);
  }
  if (isHeadOrAdmin(ctx.role)) {
    return requestedDepartmentId;
  }
  return undefined;
}

export function accessFromAuthUser(user: AuthUser): AccessContext {
  return {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
}
