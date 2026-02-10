import { LeadStatus, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'owner@chronos.local';
const OWNER_PASSWORD = 'password123';

const mockLeads = [
  {
    id: 'mock-lead-1',
    name: 'Horizon Manufacturing',
    contact: 'ops@horizon.example',
    source: 'Referral',
    status: LeadStatus.NEW,
  },
  {
    id: 'mock-lead-2',
    name: 'Summit Health Systems',
    contact: 'cfo@summithealth.example',
    source: 'Conference',
    status: LeadStatus.PROSPECTING,
  },
  {
    id: 'mock-lead-3',
    name: 'Northstar Logistics',
    contact: 'it@northstar.example',
    source: 'Inbound',
    status: LeadStatus.NEW,
  },
  {
    id: 'mock-lead-4',
    name: 'Apex Retail Group',
    contact: 'transformation@apex.example',
    source: 'Partner',
    status: LeadStatus.PROSPECTING,
  },
  {
    id: 'mock-lead-5',
    name: 'Vertex Energy Services',
    contact: 'strategy@vertex.example',
    source: 'Existing Network',
    status: LeadStatus.CONVERTED,
  },
];

const ensureOwner = async () => {
  const existing = await prisma.user.findUnique({
    where: { email: OWNER_EMAIL },
  });
  if (existing) {
    return existing;
  }

  const passwordHash = await argon2.hash(OWNER_PASSWORD);
  return prisma.user.create({
    data: {
      email: OWNER_EMAIL,
      passwordHash,
    },
  });
};

const seedMockLeads = async () => {
  const owner = await ensureOwner();

  const results = await Promise.all(
    mockLeads.map((lead, index) =>
      prisma.lead.upsert({
        where: { id: lead.id },
        update: {
          ownerId: owner.id,
          name: lead.name,
          contact: lead.contact,
          source: lead.source,
          status: lead.status,
          convertedAt:
            lead.status === LeadStatus.CONVERTED
              ? new Date(`2026-02-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`)
              : null,
        },
        create: {
          id: lead.id,
          ownerId: owner.id,
          name: lead.name,
          contact: lead.contact,
          source: lead.source,
          status: lead.status,
          convertedAt:
            lead.status === LeadStatus.CONVERTED
              ? new Date(`2026-02-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`)
              : null,
        },
      })
    )
  );

  console.log(`Seeded ${results.length} mock leads for ${OWNER_EMAIL}`);
  console.log('Mock leads:', results.map((lead) => `${lead.name} [${lead.status}]`).join(', '));
};

seedMockLeads()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
