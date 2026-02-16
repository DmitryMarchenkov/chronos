import { FastifyInstance } from 'fastify';
import { clientAiChatSchema } from '@chronos/shared-validation';
import { prisma } from '../lib/prisma';
import { requireClientMember } from '../lib/access';
import { httpError } from '../lib/errors';
import { getOpenAIChatCompletion } from '../lib/ai/openai';
import { getWikipediaSummary } from '../lib/ai/wikipedia';

export const aiRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/:clientId/ai/summary', { preHandler: fastify.authenticate }, async (request) => {
    const { clientId } = request.params as { clientId: string };
    const userId = request.user.sub;

    await requireClientMember(userId, clientId);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw httpError(404, 'NOT_FOUND', 'Client not found');
    }

    const summary = await getWikipediaSummary(client.name);

    return {
      source: 'wikipedia' as const,
      title: summary.title,
      extract: summary.extract,
      url: summary.url,
    };
  });

  fastify.post('/:clientId/ai/chat', { preHandler: fastify.authenticate }, async (request) => {
    const { clientId } = request.params as { clientId: string };
    const payload = clientAiChatSchema.parse(request.body);
    const userId = request.user.sub;

    await requireClientMember(userId, clientId);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw httpError(404, 'NOT_FOUND', 'Client not found');
    }

    const summary = await getWikipediaSummary(client.name);
    const summaryText =
      summary.title && summary.extract
        ? `${summary.title}: ${summary.extract}`
        : 'Not specified';

    const system = [
      'You are a helpful enterprise consultant assisting with a high-level client assessment.',
      'You do NOT have access to private/internal Chronos data in this phase.',
      'Use the provided Wikipedia-only summary as background context when relevant.',
      'If the summary is missing or ambiguous, say so and ask clarifying questions.',
      'Keep answers concise, practical, and oriented to next steps.',
      '',
      `Client: ${client.name}`,
      `Wikipedia_summary: ${summaryText}`,
    ].join('\n');

    const reply = await getOpenAIChatCompletion({
      system,
      user: payload.message,
    });

    return { reply };
  });
};

