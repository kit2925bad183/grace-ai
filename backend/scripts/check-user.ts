import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const email = process.argv[2] || 'vishvaganesan123@gmail.com';
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grace-ai');
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash name role emailVerified isActive authProvider googleId'
  );
  if (!user) {
    console.log('NOT_FOUND');
    process.exit(0);
  }
  console.log(
    JSON.stringify(
      {
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        authProvider: user.authProvider,
        hasPassword: Boolean(user.passwordHash),
        hasGoogle: Boolean(user.googleId),
      },
      null,
      2
    )
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
