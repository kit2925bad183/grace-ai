/**
 * One-time migration: CITIZEN→USER, OFFICER→DEPARTMENT, AUTHORITY/ADMIN→HEAD
 * Usage: npx tsx scripts/migrate-roles.ts
 */
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { User, Officer } from '../src/models';
import { UserRole } from '../src/models/enums';
import { normalizeUserRole, isLegacyRole } from '../src/utils/normalizeRole';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grace-ai');
  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    if (!isLegacyRole(user.role)) continue;

    const nextRole = normalizeUserRole(user.role);
    const update: Record<string, unknown> = { role: nextRole };

    if (nextRole === UserRole.DEPARTMENT && !user.departmentId) {
      const officer = await Officer.findOne({ userId: user._id });
      if (officer?.departmentId) {
        update.departmentId = officer.departmentId;
      } else {
        console.warn(`Skip ${user.email}: OFFICER→DEPARTMENT but no departmentId on Officer record`);
        continue;
      }
    }

    await User.updateOne({ _id: user._id }, { $set: update });
    updated += 1;
    console.log(`Migrated ${user.email}: ${user.role} → ${nextRole}`);
  }

  console.log(`Done. Updated ${updated} of ${users.length} users.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
