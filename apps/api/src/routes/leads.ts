import { FastifyInstance } from 'fastify';
import { createLeadSchema, updateLeadStatusSchema } from '@chronos/shared-validation';
import { prisma } from '../lib/prisma';
import { formatPagination, getPagination } from '../lib/pagination';
import { httpError } from '../lib/errors';

export const leadRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request) => {
    const { page, pageSize } = getPagination(request.query);
    const userId = request.user.sub;

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where: { ownerId: userId } }),
      prisma.lead.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        contact: lead.contact,
        source: lead.source,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
      })),
      pagination: formatPagination(page, pageSize, total),
    };
  });

  fastify.post('/', { preHandler: fastify.authenticate }, async (request) => {
    const payload = createLeadSchema.parse(request.body);
    const userId = request.user.sub;

    const lead = await prisma.lead.create({
      data: {
        ownerId: userId,
        name: payload.name,
        contact: payload.contact,
        source: payload.source,
      },
    });

    return {
      id: lead.id,
      name: lead.name,
      contact: lead.contact,
      source: lead.source,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    };
  });

  fastify.patch('/:leadId/status', { preHandler: fastify.authenticate }, async (request) => {
    const { leadId } = request.params as { leadId: string };
    const payload = updateLeadStatusSchema.parse(request.body);
    const userId = request.user.sub;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, ownerId: userId },
    });

    if (!lead) {
      throw httpError(404, 'NOT_FOUND', 'Lead not found');
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: payload.status,
        convertedAt: payload.status === 'CONVERTED' ? new Date() : null,
      },
    });

    return {
      id: updatedLead.id,
      name: updatedLead.name,
      contact: updatedLead.contact,
      source: updatedLead.source,
      status: updatedLead.status,
      createdAt: updatedLead.createdAt.toISOString(),
    };
  });

  fastify.post('/:leadId/convert', { preHandler: fastify.authenticate }, async (request) => {
    const { leadId } = request.params as { leadId: string };
    const userId = request.user.sub;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, ownerId: userId },
    });

    if (!lead) {
      throw httpError(404, 'NOT_FOUND', 'Lead not found');
    }

    if (lead.status === 'CONVERTED') {
      throw httpError(409, 'CONFLICT', 'Lead already converted');
    }

    const { updatedLead, client } = await prisma.$transaction(async (tx) => {
      const createdClient = await tx.client.create({
        data: {
          name: lead.name,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
      });

      const convertedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });

      return { updatedLead: convertedLead, client: createdClient };
    });

    return {
      lead: {
        id: updatedLead.id,
        name: updatedLead.name,
        contact: updatedLead.contact,
        source: updatedLead.source,
        status: updatedLead.status,
        createdAt: updatedLead.createdAt.toISOString(),
      },
      client: {
        id: client.id,
        name: client.name,
        createdAt: client.createdAt.toISOString(),
      },
    };
  });
};
