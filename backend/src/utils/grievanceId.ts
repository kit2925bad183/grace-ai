import { Grievance } from '../models/Grievance';
import { AppError } from '../middleware/errorHandler';

const MAX_RETRIES = 5;

export async function generateGrievanceId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `GRV-${year}-`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const last = await Grievance.findOne({
      grievanceId: { $regex: `^${prefix}` },
    })
      .sort({ grievanceId: -1 })
      .select('grievanceId')
      .lean();

    let nextSeq = 1001;
    if (last?.grievanceId) {
      const parts = last.grievanceId.split('-');
      const current = parseInt(parts[2] ?? '1000', 10);
      nextSeq = current + 1 + attempt;
    } else {
      nextSeq += attempt;
    }

    const candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    const exists = await Grievance.exists({ grievanceId: candidate });
    if (!exists) {
      return candidate;
    }
  }

  throw new AppError('Unable to generate unique grievance ID', 500);
}
