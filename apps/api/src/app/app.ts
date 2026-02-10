import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';
import { authRoutes } from '../routes/auth';
import { clientRoutes } from '../routes/clients';
import { assessmentRoutes } from '../routes/assessments';
import { memberRoutes } from '../routes/members';
import { leadRoutes } from '../routes/leads';
import { errorResponse, HttpError } from '../lib/errors';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance) {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecretFromEnv = process.env.JWT_SECRET;
  if (isProduction && (!jwtSecretFromEnv || jwtSecretFromEnv.length < 32)) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  const jwtSecret = jwtSecretFromEnv ?? 'dev-secret';

  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const allowedOrigins = isProduction
    ? configuredOrigins
    : configuredOrigins.length > 0
      ? configuredOrigins
      : ['http://localhost:4200', 'http://127.0.0.1:4200'];

  if (isProduction && allowedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be configured in production');
  }

  fastify.register(cors, {
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser clients that do not send an Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  });
  fastify.register(rateLimit, {
    global: false,
    keyGenerator: (request) => request.ip,
  });
  fastify.register(jwt, {
    secret: jwtSecret,
    sign: { expiresIn: '12h' },
  });
  fastify.register(sensible);

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send(
        errorResponse({
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing authentication token',
        })
      );
    }
  });

  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      reply
        .status(error.statusCode)
        .send(errorResponse({ code: error.code, message: error.message, details: error.details }));
      return;
    }

    if (
      typeof (error as { statusCode?: unknown }).statusCode === 'number' &&
      (error as { statusCode: number }).statusCode >= 400 &&
      (error as { statusCode: number }).statusCode < 500
    ) {
      const requestError = error as { statusCode: number; code?: string; message?: string };
      const statusCode = (error as { statusCode: number }).statusCode;
      const code = typeof requestError.code === 'string'
        ? String(requestError.code)
        : 'REQUEST_ERROR';
      reply.status(statusCode).send(
        errorResponse({
          code,
          message: requestError.message || 'Request failed',
        })
      );
      return;
    }

    if (error instanceof ZodError) {
      reply.status(400).send(
        errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.flatten(),
        })
      );
      return;
    }

    reply.status(500).send(
      errorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Unexpected error',
      })
    );
  });

  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send(
      errorResponse({
        code: 'NOT_FOUND',
        message: 'Route not found',
      })
    );
  });

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(leadRoutes, { prefix: '/leads' });
  fastify.register(clientRoutes, { prefix: '/clients' });
  fastify.register(memberRoutes, { prefix: '/clients' });
  fastify.register(assessmentRoutes);
}
