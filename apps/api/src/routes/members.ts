import { FastifyInstance } from 'fastify';
import argon2 from 'argon2';
import { addMemberSchema } from '@chronos/shared-validation';
import { Role as PrismaRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireClientMember, requireOwnerRole } from '../lib/access';
import { formatPagination, getPagination } from '../lib/pagination';
import { httpError } from '../lib/errors';

export const memberRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    '/:clientId/members',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { clientId } = request.params as { clientId: string };
      const userId = request.user.sub;

      await requireClientMember(userId, clientId);

      const { page, pageSize } = getPagination(request.query);

      const [total, members] = await prisma.$transaction([
        prisma.workspaceMember.count({ where: { clientId } }),
        prisma.workspaceMember.findMany({
          where: { clientId },
          include: { user: true },
          orderBy: { createdAt: 'asc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return {
        data: members.map((member) => ({
          id: member.id,
          userId: member.userId,
          email: member.user.email,
          role: member.role,
          createdAt: member.createdAt.toISOString(),
        })),
        pagination: formatPagination(page, pageSize, total),
      };
    }
  );

  fastify.post(
    '/:clientId/members',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { clientId } = request.params as { clientId: string };
      const payload = addMemberSchema.parse(request.body);
      const userId = request.user.sub;

      const membership = await requireClientMember(userId, clientId);
      requireOwnerRole(membership.role);

      let user = await prisma.user.findUnique({ where: { email: payload.email } });
      let temporaryPassword: string | undefined;

      if (!user) {
        temporaryPassword = 'ChangeMe123!';
        user = await prisma.user.create({
          data: {
            email: payload.email,
            passwordHash: await argon2.hash(temporaryPassword),
          },
        });
      }

      const existing = await prisma.workspaceMember.findUnique({
        where: {
          userId_clientId: {
            userId: user.id,
            clientId,
          },
        },
      });

      if (existing) {
        throw httpError(409, 'MEMBER_EXISTS', 'User is already a member');
      }

      const created = await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          clientId,
          role: payload.role as PrismaRole,
        },
      });

      return {
        id: created.id,
        userId: created.userId,
        role: created.role,
        temporaryPassword,
      };
    }
  );
};
