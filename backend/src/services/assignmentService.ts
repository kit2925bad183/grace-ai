import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { Grievance, GrievanceStatusHistory, Officer, Department } from '../models';
import { GrievanceStatus, NotificationType, UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationService';

async function findGrievance(identifier: string) {
  if (identifier.startsWith('GRV-')) {
    return Grievance.findOne({ grievanceId: identifier });
  }
  if (/^[a-f\d]{24}$/i.test(identifier)) {
    return Grievance.findById(identifier);
  }
  return null;
}

export async function assignOfficer(params: {
  identifier: string;
  officerId: string;
  changedBy: string;
  comment?: string;
  userRole: UserRole;
}) {
  if (params.userRole !== UserRole.AUTHORITY && params.userRole !== UserRole.ADMIN) {
    throw new AppError('Insufficient permissions', 403);
  }

  const grievance = await findGrievance(params.identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  const officer = await Officer.findById(params.officerId).populate('userId', 'name email');
  if (!officer || !officer.active) {
    throw new AppError('Officer not found or inactive', 404);
  }

  if (!officer.departmentId.equals(grievance.departmentId)) {
    throw new AppError('Officer does not belong to the grievance department', 400);
  }

  const department = await Department.findById(grievance.departmentId);
  const oldStatus = grievance.status;
  const newStatus =
    oldStatus === GrievanceStatus.SUBMITTED || oldStatus === GrievanceStatus.AI_ANALYZED
      ? GrievanceStatus.ASSIGNED
      : oldStatus;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    grievance.assignedOfficerId = officer._id as Types.ObjectId;
    if (newStatus !== oldStatus) {
      grievance.status = newStatus;
    }
    await grievance.save({ session });

    if (newStatus !== oldStatus) {
      await GrievanceStatusHistory.create(
        [
          {
            grievanceId: grievance._id,
            oldStatus,
            newStatus,
            changedBy: params.changedBy,
            comment: params.comment ?? `Assigned to ${officer.designation}`,
          },
        ],
        { session }
      );
    } else {
      await GrievanceStatusHistory.create(
        [
          {
            grievanceId: grievance._id,
            oldStatus,
            newStatus: oldStatus,
            changedBy: params.changedBy,
            comment: params.comment ?? `Officer reassigned to ${officer.designation}`,
          },
        ],
        { session }
      );
    }

    await createNotification({
      userId: grievance.citizenId as Types.ObjectId,
      title: 'Officer Assigned',
      message: `Your grievance ${grievance.grievanceId} has been assigned to the ${department?.name ?? 'responsible department'}.`,
      type: NotificationType.ASSIGNMENT,
      session,
    });

    const officerUser = officer.userId as unknown as { _id: Types.ObjectId };
    if (officerUser?._id) {
      await createNotification({
        userId: officerUser._id,
        title: 'New Assignment',
        message: `Grievance ${grievance.grievanceId} has been assigned to you.`,
        type: NotificationType.ASSIGNMENT,
        session,
      });
    }

    await session.commitTransaction();

    return Grievance.findById(grievance._id)
      .populate([
        { path: 'categoryId', select: 'name' },
        { path: 'departmentId', select: 'name code' },
        { path: 'wardId', select: 'name code' },
        {
          path: 'assignedOfficerId',
          select: 'designation employeeCode',
          populate: { path: 'userId', select: 'name email' },
        },
      ])
      .lean();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
