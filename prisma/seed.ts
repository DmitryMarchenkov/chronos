import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  const email = 'owner@chronos.local';
  const password = 'password123';

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  });

  const client = await prisma.client.upsert({
    where: { id: 'seed-client' },
    update: { name: 'Acme Consulting' },
    create: {
      id: 'seed-client',
      name: 'Acme Consulting',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_clientId: {
        userId: user.id,
        clientId: client.id,
      },
    },
    update: { role: 'OWNER' },
    create: {
      userId: user.id,
      clientId: client.id,
      role: 'OWNER',
    },
  });

  const assessment = await prisma.assessment.upsert({
    where: { id: 'seed-assessment' },
    update: { type: 'AI_ADOPTION' },
    create: {
      id: 'seed-assessment',
      clientId: client.id,
      type: 'AI_ADOPTION',
      createdById: user.id,
    },
  });

  const domains = [
    'STRATEGY',
    'PROCESS',
    'DATA',
    'TECH',
    'PEOPLE',
    'GOVERNANCE',
    'SECURITY',
  ] as const;

  await Promise.all(
    domains.map((domain) =>
      prisma.assessmentDomainScore.upsert({
        where: {
          assessmentId_domain: {
            assessmentId: assessment.id,
            domain,
          },
        },
        update: {},
        create: {
          assessmentId: assessment.id,
          domain,
          score: 2,
          notes: 'Seeded baseline score',
        },
      })
    )
  );

  console.log('Seeded user:', email, 'password:', password);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
