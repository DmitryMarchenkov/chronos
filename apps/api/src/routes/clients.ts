import { FastifyInstance } from 'fastify';
import { createClientSchema } from '@chronos/shared-validation';
import { prisma } from '../lib/prisma';
import { formatPagination, getPagination } from '../lib/pagination';
import { requireClientMember } from '../lib/access';
import { httpError } from '../lib/errors';

export const clientRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request) => {
    const { page, pageSize } = getPagination(request.query);
    const userId = request.user.sub;

    const [total, clients] = await prisma.$transaction([
      prisma.client.count({
        where: {
          members: {
            some: { userId },
          },
        },
      }),
      prisma.client.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: clients.map((client) => ({
        id: client.id,
        name: client.name,
        createdAt: client.createdAt.toISOString(),
      })),
      pagination: formatPagination(page, pageSize, total),
    };
  });

  fastify.post('/', { preHandler: fastify.authenticate }, async (request) => {
    const payload = createClientSchema.parse(request.body);
    const userId = request.user.sub;

    const client = await prisma.client.create({
      data: {
        name: payload.name,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    return {
      id: client.id,
      name: client.name,
      createdAt: client.createdAt.toISOString(),
    };
  });

  fastify.get('/:clientId', { preHandler: fastify.authenticate }, async (request) => {
    const { clientId } = request.params as { clientId: string };
    const userId = request.user.sub;

    await requireClientMember(userId, clientId);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw httpError(404, 'NOT_FOUND', 'Client not found');
    }

    return {
      id: client.id,
      name: client.name,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  });
};
