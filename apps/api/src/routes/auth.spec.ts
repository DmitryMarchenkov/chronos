import Fastify, { FastifyInstance } from 'fastify';
import argon2 from 'argon2';
import { app } from '../app/app';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('argon2', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    verify: jest.fn(),
  },
}));

describe('auth routes', () => {
  let server: FastifyInstance;
  const prismaMock = prisma as unknown as {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  const argon2Mock = argon2 as unknown as {
    hash: jest.Mock;
    verify: jest.Mock;
  };

  beforeEach(async () => {
    server = Fastify();
    server.register(app);
    await server.ready();

    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
    argon2Mock.hash.mockReset();
    argon2Mock.verify.mockReset();
  });

  afterEach(async () => {
    await server.close();
  });

  it('registers a new user and returns a token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    argon2Mock.hash.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@chronos.local',
    });

    const response = await server.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'new@chronos.local', password: 'password123' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { token: string; user: { id: string; email: string } };
    expect(body.user).toEqual({ id: 'user-1', email: 'new@chronos.local' });
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });

  it('returns INVALID_CREDENTIALS when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'missing@chronos.local', password: 'password123' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  });

  it('returns INVALID_CREDENTIALS for wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@chronos.local',
      passwordHash: 'stored-hash',
    });
    argon2Mock.verify.mockResolvedValue(false);

    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'owner@chronos.local', password: 'wrongpass1' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  });

  it('applies auth route rate limiting', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'missing@chronos.local', password: 'password123' },
      });
      expect(response.statusCode).toBe(401);
    }

    const rateLimited = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'missing@chronos.local', password: 'password123' },
    });

    expect(rateLimited.statusCode).toBe(429);
  });
});
