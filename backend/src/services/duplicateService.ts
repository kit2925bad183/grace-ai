import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { DuplicateMatch, Grievance } from '../models';
import { DuplicateMatchStatus, NotificationType, UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationService';

export async function listAllDuplicates(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;

  let matchIds: Types.ObjectId[] | undefined;
  if (filters.search) {
    const grievances = await Grievance.find({
      $or: [
        { grievanceId: { $regex: filters.search, $options: 'i' } },
        { title: { $regex: filters.search, $options: 'i' } },
      ],
    }).select('_id');
    matchIds = grievances.map((g) => g._id as Types.ObjectId);
    query.$or = [{ grievanceId: { $in: matchIds } }, { matchedGrievanceId: { $in: matchIds } }];
  }

  const [items, total] = await Promise.all([
    DuplicateMatch.find(query)
      .populate({
        path: 'grievanceId',
        select: 'grievanceId title status departmentId wardId',
        populate: [
          { path: 'departmentId', select: 'name' },
          { path: 'wardId', select: 'name' },
        ],
      })
      .populate({
        path: 'matchedGrievanceId',
        select: 'grievanceId title status',
      })
      .sort({ similarityScore: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DuplicateMatch.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function updateDuplicateStatus(params: {
  id: string;
  status: DuplicateMatchStatus;
  userId: string;
  userRole: UserRole;
}) {
  if (params.userRole !== UserRole.AUTHORITY && params.userRole !== UserRole.ADMIN) {
    throw new AppError('Insufficient permissions', 403);
  }

  const duplicate = await DuplicateMatch.findById(params.id);
  if (!duplicate) throw new AppError('Duplicate match not found', 404);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    duplicate.status = params.status;
    await duplicate.save({ session });

    if (params.status === DuplicateMatchStatus.MERGED) {
      const primary = await Grievance.findById(duplicate.grievanceId);
      const matched = await Grievance.findById(duplicate.matchedGrievanceId);

      if (primary && matched) {
        matched.mergedIntoGrievanceId = primary._id as Types.ObjectId;
        await matched.save({ session });

        await createNotification({
          userId: matched.citizenId as Types.ObjectId,
          title: 'Duplicate Complaint Merged',
          message: `Your grievance ${matched.grievanceId} has been merged with ${primary.grievanceId}.`,
          type: NotificationType.DUPLICATE,
          session,
        });
      }
    }

    await session.commitTransaction();

    return DuplicateMatch.findById(duplicate._id)
      .populate('grievanceId', 'grievanceId title')
      .populate('matchedGrievanceId', 'grievanceId title')
      .lean();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
