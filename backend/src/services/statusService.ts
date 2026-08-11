import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { Grievance, GrievanceStatusHistory, SLAPrediction } from '../models';
import {
  GrievanceStatus,
  NotificationType,
  UserRole,
} from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationService';
import { computeSlaPrediction } from '../ai/slaPredictionService';

const AUTHORITY_ALLOWED_STATUSES: GrievanceStatus[] = [
  GrievanceStatus.ASSIGNED,
  GrievanceStatus.UNDER_REVIEW,
  GrievanceStatus.IN_PROGRESS,
  GrievanceStatus.ESCALATED,
  GrievanceStatus.RESOLVED,
  GrievanceStatus.CLOSED,
  GrievanceStatus.REJECTED,
];

async function findGrievance(identifier: string) {
  if (identifier.startsWith('GRV-')) {
    return Grievance.findOne({ grievanceId: identifier });
  }
  if (/^[a-f\d]{24}$/i.test(identifier)) {
    return Grievance.findById(identifier);
  }
  return null;
}

function getStatusNotificationMessage(
  grievanceId: string,
  newStatus: GrievanceStatus,
  departmentName?: string
): { title: string; message: string; type: NotificationType } {
  switch (newStatus) {
    case GrievanceStatus.ASSIGNED:
      return {
        title: 'Officer Assigned',
        message: `Your grievance ${grievanceId} has been assigned${departmentName ? ` to the ${departmentName}` : ''}.`,
        type: NotificationType.ASSIGNMENT,
      };
    case GrievanceStatus.IN_PROGRESS:
      return {
        title: 'Status Update',
        message: `Your grievance ${grievanceId} is currently under field inspection.`,
        type: NotificationType.STATUS_UPDATE,
      };
    case GrievanceStatus.ESCALATED:
      return {
        title: 'Grievance Escalated',
        message: `Your grievance ${grievanceId} has been escalated for priority review.`,
        type: NotificationType.STATUS_UPDATE,
      };
    case GrievanceStatus.RESOLVED:
      return {
        title: 'Grievance Resolved',
        message: `Your grievance ${grievanceId} has been resolved.`,
        type: NotificationType.RESOLUTION,
      };
    case GrievanceStatus.CLOSED:
      return {
        title: 'Grievance Closed',
        message: `Your grievance ${grievanceId} has been closed.`,
        type: NotificationType.RESOLUTION,
      };
    default:
      return {
        title: 'Status Update',
        message: `Your grievance ${grievanceId} status is now ${newStatus.replace(/_/g, ' ')}.`,
        type: NotificationType.STATUS_UPDATE,
      };
  }
}

export async function updateGrievanceStatus(params: {
  identifier: string;
  newStatus: GrievanceStatus;
  changedBy: string;
  comment?: string;
  userRole: UserRole;
}) {
  if (
    params.userRole !== UserRole.AUTHORITY &&
    params.userRole !== UserRole.ADMIN
  ) {
    throw new AppError('Insufficient permissions', 403);
  }

  if (!AUTHORITY_ALLOWED_STATUSES.includes(params.newStatus)) {
    throw new AppError('Invalid status transition', 400);
  }

  const grievance = await findGrievance(params.identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  const oldStatus = grievance.status;
  if (oldStatus === params.newStatus) {
    throw new AppError('Grievance is already in this status', 409);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    grievance.status = params.newStatus;

    if (params.newStatus === GrievanceStatus.RESOLVED) {
      grievance.resolvedAt = new Date();
    }

    await grievance.save({ session });

    await GrievanceStatusHistory.create(
      [
        {
          grievanceId: grievance._id,
          oldStatus,
          newStatus: params.newStatus,
          changedBy: params.changedBy,
          comment: params.comment ?? `Status updated to ${params.newStatus}`,
        },
      ],
      { session }
    );

    const notif = getStatusNotificationMessage(grievance.grievanceId, params.newStatus);
    await createNotification({
      userId: grievance.citizenId as Types.ObjectId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      session,
    });

    if (params.newStatus === GrievanceStatus.ESCALATED) {
      const sla = await SLAPrediction.findOne({ grievanceId: grievance._id });
      if (sla) {
        sla.recommendation =
          'Escalate to senior officer and prioritize field inspection due to SLA risk.';
        await sla.save({ session });
      }
    }

    if (
      params.newStatus === GrievanceStatus.IN_PROGRESS ||
      params.newStatus === GrievanceStatus.RESOLVED
    ) {
      const sla = await SLAPrediction.findOne({ grievanceId: grievance._id });
      if (sla) {
        const updated = computeSlaPrediction(
          grievance.priority,
          grievance.createdAt,
          grievance.slaDeadline,
          params.newStatus
        );
        sla.riskLevel = updated.riskLevel;
        sla.riskPercentage = updated.riskPercentage;
        sla.remainingHours = updated.remainingHours;
        await sla.save({ session });
      }
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

export { AUTHORITY_ALLOWED_STATUSES };
