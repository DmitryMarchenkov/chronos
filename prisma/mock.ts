import { PrismaClient, AssessmentDomain, AssessmentType, Role } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const MOCK_PASSWORD = 'password123';

const mockUsers = [
  { email: 'consultant1@chronos.local', role: Role.CONSULTANT },
  { email: 'consultant2@chronos.local', role: Role.CONSULTANT },
  { email: 'viewer1@chronos.local', role: Role.VIEWER },
];

const mockClients = [
  { id: 'mock-client-1', name: 'Northwind Labs' },
  { id: 'mock-client-2', name: 'Globex Advisors' },
  { id: 'mock-client-3', name: 'Initech Strategy' },
];

const mockAssessmentsPerClient = 3;

const seedMockData = async () => {
  const passwordHash = await argon2.hash(MOCK_PASSWORD);

  const users = await Promise.all(
    mockUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          passwordHash,
        },
      })
    )
  );

  const clients = await Promise.all(
    mockClients.map((client) =>
      prisma.client.upsert({
        where: { id: client.id },
        update: { name: client.name },
        create: {
          id: client.id,
          name: client.name,
        },
      })
    )
  );

  for (const client of clients) {
    const tasks: Array<Promise<unknown>> = [];

    for (const [index, user] of users.entries()) {
      tasks.push(
        prisma.workspaceMember.upsert({
          where: {
            userId_clientId: {
              userId: user.id,
              clientId: client.id,
            },
          },
          update: {
            role: mockUsers[index]?.role ?? Role.VIEWER,
          },
          create: {
            userId: user.id,
            clientId: client.id,
            role: mockUsers[index]?.role ?? Role.VIEWER,
          },
        })
      );
    }

    for (let i = 0; i < mockAssessmentsPerClient; i += 1) {
      tasks.push(
        (async () => {
          const assessmentId = `mock-assessment-${client.id}-${i + 1}`;
          const assessmentType =
            i % 2 === 0 ? AssessmentType.AI_ADOPTION : AssessmentType.DIGITAL_TRANSFORMATION;

          await prisma.assessment.upsert({
            where: { id: assessmentId },
            update: { type: assessmentType },
            create: {
              id: assessmentId,
              clientId: client.id,
              type: assessmentType,
              createdById: users[0]?.id,
            },
          });

          for (const [domainIndex, domain] of Object.values(AssessmentDomain).entries()) {
            await prisma.assessmentDomainScore.upsert({
              where: {
                assessmentId_domain: {
                  assessmentId,
                  domain,
                },
              },
              update: {},
              create: {
                assessmentId,
                domain,
                score: (i + domainIndex + client.name.length) % 5,
                notes: `Mock data for ${domain.toLowerCase()}`,
              },
            });
          }
        })()
      );
    }

    await Promise.all(tasks);
  }

  console.log('Mock users (password):', MOCK_PASSWORD);
  console.log('Mock user emails:', mockUsers.map((user) => user.email).join(', '));
  console.log('Mock clients:', mockClients.map((client) => client.name).join(', '));
};

seedMockData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
