import { Types } from 'mongoose';
import { Grievance, GrievanceStatusHistory, Officer, Department } from '../models';
import { GrievanceStatus, NotificationType } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { assertCanManageGrievance, type AccessContext } from '../utils/accessControl';
import { createNotification } from './notificationService';
import { writeAuditLog } from './auditService';
import { runInTransaction, sessionOptions } from '../utils/transaction';

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
  access: AccessContext;
}) {
  const grievance = await findGrievance(params.identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  assertCanManageGrievance(grievance, params.access);

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

  return runInTransaction(async (session) => {
    const opts = sessionOptions(session);

    grievance.assignedOfficerId = officer._id as Types.ObjectId;
    if (newStatus !== oldStatus) {
      grievance.status = newStatus;
    }
    await grievance.save(opts);

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
        opts
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
        opts
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

    await writeAuditLog({
      userId: params.changedBy,
      action: 'GRIEVANCE_ASSIGN_OFFICER',
      resourceType: 'Grievance',
      resourceId: grievance.grievanceId,
      newValue: { officerId: params.officerId, status: newStatus },
    });

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
  });
}
