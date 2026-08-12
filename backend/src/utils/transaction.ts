import mongoose, { ClientSession } from 'mongoose';

let replicaSetSupported: boolean | null = null;

export async function isReplicaSetSupported(): Promise<boolean> {
  if (replicaSetSupported !== null) return replicaSetSupported;

  try {
    const db = mongoose.connection.db;
    if (!db) {
      replicaSetSupported = false;
      return false;
    }

    const hello = await db.admin().command({ hello: 1 });
    replicaSetSupported = Boolean(hello.setName);
    return replicaSetSupported;
  } catch {
    replicaSetSupported = false;
    return false;
  }
}

export async function runInTransaction<T>(
  fn: (session: ClientSession | undefined) => Promise<T>
): Promise<T> {
  if (!(await isReplicaSetSupported())) {
    return fn(undefined);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export function sessionOptions(session?: ClientSession): { session: ClientSession } | Record<string, never> {
  return session ? { session } : {};
}
