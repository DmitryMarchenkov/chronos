import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';

describe('app security bootstrap', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('fails startup in production when JWT_SECRET is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    process.env.CORS_ORIGINS = 'https://chronos.example.com';

    const server = Fastify();
    server.register(app);

    await expect(server.ready()).rejects.toThrow(
      'JWT_SECRET must be set and at least 32 characters in production'
    );
  });

  it('fails startup in production when CORS_ORIGINS is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    delete process.env.CORS_ORIGINS;

    const server = Fastify();
    server.register(app);

    await expect(server.ready()).rejects.toThrow('CORS_ORIGINS must be configured in production');
  });

  it('rejects protected route requests without a JWT', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.CORS_ORIGINS;

    const server: FastifyInstance = Fastify();
    server.register(app);
    await server.ready();

    const response = await server.inject({
      method: 'GET',
      url: '/clients',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing authentication token',
      },
    });

    await server.close();
  });
});
