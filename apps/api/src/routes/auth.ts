import { FastifyInstance } from 'fastify';
import argon2 from 'argon2';
import { loginSchema, registerSchema } from '@chronos/shared-validation';
import { prisma } from '../lib/prisma';
import { httpError } from '../lib/errors';

export const authRoutes = async (fastify: FastifyInstance) => {
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  } as const;

  fastify.post('/register', authRateLimit, async (request) => {
    const payload = registerSchema.parse(request.body);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existing) {
      throw httpError(409, 'EMAIL_TAKEN', 'Email is already registered');
    }

    const passwordHash = await argon2.hash(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
      },
    });

    const token = fastify.jwt.sign({ sub: user.id, email: user.email });

    return { token, user: { id: user.id, email: user.email } };
  });

  fastify.post('/login', authRateLimit, async (request) => {
    const payload = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw httpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, payload.password);
    if (!valid) {
      throw httpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = fastify.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  });
};
