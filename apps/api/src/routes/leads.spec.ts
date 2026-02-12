import Fastify, { FastifyInstance } from 'fastify';
import { LeadStatus } from '@prisma/client';
import { app } from '../app/app';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    lead: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    client: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('lead routes', () => {
  let server: FastifyInstance;
  const prismaMock = prisma as unknown as {
    lead: {
      count: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    client: {
      create: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    server = Fastify();
    server.register(app);
    await server.ready();

    prismaMock.lead.count.mockReset();
    prismaMock.lead.findMany.mockReset();
    prismaMock.lead.create.mockReset();
    prismaMock.lead.findFirst.mockReset();
    prismaMock.lead.update.mockReset();
    prismaMock.client.create.mockReset();
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
    prismaMock.$transaction.mockReset();

    prismaMock.$transaction.mockImplementation((input: unknown) => {
      if (typeof input === 'function') {
        return input({
          lead: {
            update: prismaMock.lead.update,
          },
          client: {
            create: prismaMock.client.create,
          },
        });
      }
      return Promise.all(input as Promise<unknown>[]);
    });
  });

  afterEach(async () => {
    await server.close();
  });

  const signToken = async (userId: string) => {
    const email = `${userId}@chronos.local`;
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({ id: userId, email });

    const response = await server.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });

    return (response.json() as { token: string }).token;
  };

  it('validates lead creation payload', async () => {
    const token = await signToken('user-1');

    const response = await server.inject({
      method: 'POST',
      url: '/leads',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'X' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
      },
    });
  });

  it('lists leads scoped to authenticated owner', async () => {
    const token = await signToken('user-1');
    prismaMock.lead.count.mockResolvedValue(1);
    prismaMock.lead.findMany.mockResolvedValue([
      {
        id: 'lead-1',
        name: 'Acme',
        contact: 'owner@acme.com',
        source: 'Referral',
        status: LeadStatus.NEW,
        createdAt: new Date('2026-02-10T10:00:00.000Z'),
      },
    ]);

    const response = await server.inject({
      method: 'GET',
      url: '/leads',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(prismaMock.lead.count).toHaveBeenCalledWith({ where: { ownerId: 'user-1' } });
    expect(prismaMock.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 'user-1' },
      })
    );
    expect(response.json()).toMatchObject({
      data: [
        {
          id: 'lead-1',
          name: 'Acme',
          status: 'NEW',
        },
      ],
    });
  });

  it('blocks status updates for non-owned leads', async () => {
    const token = await signToken('user-1');
    prismaMock.lead.findFirst.mockResolvedValue(null);

    const response = await server.inject({
      method: 'PATCH',
      url: '/leads/lead-x/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'PROSPECTING' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Lead not found',
      },
    });
  });

  it('validates status updates against shared enum values', async () => {
    const token = await signToken('user-1');

    const response = await server.inject({
      method: 'PATCH',
      url: '/leads/lead-x/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'INVALID_STATUS' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
      },
    });
  });

  it('converts a lead into a client and marks lead as converted', async () => {
    const token = await signToken('user-1');

    prismaMock.lead.findFirst.mockResolvedValue({
      id: 'lead-9',
      ownerId: 'user-1',
      name: 'Nova Corp',
      contact: 'hello@nova.com',
      source: 'Partner',
      status: LeadStatus.PROSPECTING,
      createdAt: new Date('2026-02-10T10:00:00.000Z'),
    });
    prismaMock.client.create.mockResolvedValue({
      id: 'client-9',
      name: 'Nova Corp',
      createdAt: new Date('2026-02-10T11:00:00.000Z'),
    });
    prismaMock.lead.update.mockResolvedValue({
      id: 'lead-9',
      ownerId: 'user-1',
      name: 'Nova Corp',
      contact: 'hello@nova.com',
      source: 'Partner',
      status: LeadStatus.CONVERTED,
      createdAt: new Date('2026-02-10T10:00:00.000Z'),
    });

    const response = await server.inject({
      method: 'POST',
      url: '/leads/lead-9/convert',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(prismaMock.client.create).toHaveBeenCalledWith({
      data: {
        name: 'Nova Corp',
        members: {
          create: {
            userId: 'user-1',
            role: 'OWNER',
          },
        },
      },
    });
    expect(prismaMock.lead.update).toHaveBeenCalledWith({
      where: { id: 'lead-9' },
      data: expect.objectContaining({ status: 'CONVERTED' }),
    });
    expect(response.json()).toMatchObject({
      lead: {
        id: 'lead-9',
        status: 'CONVERTED',
      },
      client: {
        id: 'client-9',
        name: 'Nova Corp',
      },
    });
  });
});
