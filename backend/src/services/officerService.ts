import { Officer } from '../models';
import { AppError } from '../middleware/errorHandler';

const OFFICER_POPULATE = [
  { path: 'userId', select: 'name email phone' },
  { path: 'departmentId', select: 'name code' },
  { path: 'wardIds', select: 'name code' },
];

export async function getAllOfficers(departmentId?: string) {
  const query: Record<string, unknown> = { active: true };
  if (departmentId) query.departmentId = departmentId;

  return Officer.find(query).populate(OFFICER_POPULATE).sort({ designation: 1 }).lean();
}

export async function getOfficerById(id: string) {
  const officer = await Officer.findOne({ _id: id, active: true })
    .populate(OFFICER_POPULATE)
    .lean();
  if (!officer) throw new AppError('Officer not found', 404);
  return officer;
}

export async function getOfficersByDepartment(departmentId: string) {
  return Officer.find({ departmentId, active: true })
    .populate(OFFICER_POPULATE)
    .sort({ designation: 1 })
    .lean();
}
