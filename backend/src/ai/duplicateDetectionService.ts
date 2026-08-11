import { Types } from 'mongoose';
import { Grievance } from '../models/Grievance';
import { DuplicateMatchStatus } from '../models/enums';

export interface DuplicateCandidate {
  matchedGrievanceId: Types.ObjectId;
  matchedGrievancePublicId: string;
  matchedTitle: string;
  similarityScore: number;
  reason: string;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function computeSimilarity(
  sourceTitle: string,
  sourceDescription: string,
  sourceLocation: string,
  targetTitle: string,
  targetDescription: string,
  targetLocation: string,
  sameCategory: boolean,
  sameWard: boolean
): { score: number; reason: string } {
  const sourceTokens = tokenize(`${sourceTitle} ${sourceDescription} ${sourceLocation}`);
  const targetTokens = tokenize(`${targetTitle} ${targetDescription} ${targetLocation}`);
  const textScore = jaccardSimilarity(sourceTokens, targetTokens);

  let score = Math.round(textScore * 100);
  const reasons: string[] = [];

  if (sameCategory) {
    score += 10;
    reasons.push('same category');
  }
  if (sameWard) {
    score += 10;
    reasons.push('same ward');
  }

  score = Math.min(99, score);

  const reason =
    reasons.length > 0
      ? `Similar description and ${reasons.join(', ')}`
      : 'Similar description and keywords';

  return { score, reason };
}

export async function detectDuplicates(params: {
  title: string;
  description: string;
  location: string;
  categoryId: Types.ObjectId;
  wardId: Types.ObjectId;
  excludeGrievanceId?: Types.ObjectId;
}): Promise<DuplicateCandidate[]> {
  const candidates = await Grievance.find({
    categoryId: params.categoryId,
    wardId: params.wardId,
    ...(params.excludeGrievanceId ? { _id: { $ne: params.excludeGrievanceId } } : {}),
  })
    .select('grievanceId title description location categoryId wardId')
    .limit(50)
    .lean();

  const matches: DuplicateCandidate[] = [];

  for (const g of candidates) {
    const { score, reason } = computeSimilarity(
      params.title,
      params.description,
      params.location,
      g.title,
      g.description,
      g.location,
      g.categoryId.equals(params.categoryId),
      g.wardId.equals(params.wardId)
    );

    if (score >= 50) {
      matches.push({
        matchedGrievanceId: g._id as Types.ObjectId,
        matchedGrievancePublicId: g.grievanceId,
        matchedTitle: g.title,
        similarityScore: score,
        reason,
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
}

export { DuplicateMatchStatus };
