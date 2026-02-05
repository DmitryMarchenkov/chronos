import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';
import { authRoutes } from '../routes/auth';
import { clientRoutes } from '../routes/clients';
import { assessmentRoutes } from '../routes/assessments';
import { memberRoutes } from '../routes/members';
import { errorResponse, HttpError } from '../lib/errors';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance) {
  fastify.register(cors, { origin: true });
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    sign: { expiresIn: '12h' },
  });
  fastify.register(sensible);

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
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
  fastify.register(clientRoutes, { prefix: '/clients' });
  fastify.register(memberRoutes, { prefix: '/clients' });
  fastify.register(assessmentRoutes);
}
