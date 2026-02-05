import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';

describe('GET /health', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('should respond with a message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.json()).toEqual({ status: 'ok' });
  });
});
