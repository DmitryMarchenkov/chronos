import { FastifyInstance } from 'fastify';
import {
  AssessmentDomain as PrismaAssessmentDomain,
  AssessmentType as PrismaAssessmentType,
} from '@prisma/client';
import {
  createAssessmentSchema,
  updateScoresSchema,
} from '@chronos/shared-validation';
import { prisma } from '../lib/prisma';
import { formatPagination, getPagination } from '../lib/pagination';
import { httpError } from '../lib/errors';
import { requireClientMember, requireWriteRole } from '../lib/access';

export const assessmentRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    '/clients/:clientId/assessments',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { clientId } = request.params as { clientId: string };
      const { page, pageSize } = getPagination(request.query);
      const userId = request.user.sub;

      await requireClientMember(userId, clientId);

      const [total, assessments] = await prisma.$transaction([
        prisma.assessment.count({ where: { clientId } }),
        prisma.assessment.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return {
        data: assessments.map((assessment) => ({
          id: assessment.id,
          clientId: assessment.clientId,
          type: assessment.type,
          createdAt: assessment.createdAt.toISOString(),
        })),
        pagination: formatPagination(page, pageSize, total),
      };
    }
  );

  fastify.post(
    '/clients/:clientId/assessments',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { clientId } = request.params as { clientId: string };
      const payload = createAssessmentSchema.parse(request.body);
      const userId = request.user.sub;

      const membership = await requireClientMember(userId, clientId);
      requireWriteRole(membership.role);

      const assessment = await prisma.assessment.create({
        data: {
          clientId,
          type: payload.type as PrismaAssessmentType,
          createdById: userId,
          scores: {
            create: Object.values(PrismaAssessmentDomain).map((domain) => ({
              domain,
              score: 0,
              notes: null,
            })),
          },
        },
        include: { scores: true },
      });

      return {
        id: assessment.id,
        clientId: assessment.clientId,
        type: assessment.type,
        createdAt: assessment.createdAt.toISOString(),
      };
    }
  );

  fastify.get(
    '/assessments/:assessmentId/scores',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: string };
      const userId = request.user.sub;

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          scores: {
            orderBy: { domain: 'asc' },
          },
        },
      });

      if (!assessment) {
        throw httpError(404, 'NOT_FOUND', 'Assessment not found');
      }

      await requireClientMember(userId, assessment.clientId);

      const { page, pageSize } = getPagination(request.query);
      const total = assessment.scores.length;
      const paged = assessment.scores.slice((page - 1) * pageSize, page * pageSize);

      return {
        data: paged.map((score) => ({
          id: score.id,
          assessmentId: score.assessmentId,
          domain: score.domain,
          score: score.score,
          notes: score.notes,
        })),
        pagination: formatPagination(page, pageSize, total),
      };
    }
  );

  fastify.put(
    '/assessments/:assessmentId/scores',
    { preHandler: fastify.authenticate },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: string };
      const payload = updateScoresSchema.parse(request.body);
      const userId = request.user.sub;

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        throw httpError(404, 'NOT_FOUND', 'Assessment not found');
      }

      const membership = await requireClientMember(userId, assessment.clientId);
      requireWriteRole(membership.role);

      await prisma.$transaction(
        payload.scores.map((score) =>
          prisma.assessmentDomainScore.upsert({
            where: {
              assessmentId_domain: {
                assessmentId,
                domain: score.domain as PrismaAssessmentDomain,
              },
            },
            update: {
              score: score.score,
              notes: score.notes ?? null,
            },
            create: {
              assessmentId,
              domain: score.domain as PrismaAssessmentDomain,
              score: score.score,
              notes: score.notes ?? null,
            },
          })
        )
      );

      const updated = await prisma.assessmentDomainScore.findMany({
        where: { assessmentId },
        orderBy: { domain: 'asc' },
      });

      return {
        data: updated.map((score) => ({
          id: score.id,
          assessmentId: score.assessmentId,
          domain: score.domain,
          score: score.score,
          notes: score.notes,
        })),
      };
    }
  );
};
