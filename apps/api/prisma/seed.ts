import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../src/platform/demo/demo-data';

/**
 * Development/test convenience only: creates the demo account used by `POST /auth/demo-login`.
 * Idempotent. Refuses to run against production.
 */
async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production');
  }
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: {
        email: DEMO_EMAIL,
        name: 'Demo Driver',
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
        isOnboarded: true,
      },
    });
    console.log(`Demo user ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
