import Fastify from 'fastify';
import dotenv from 'dotenv';
import { app } from './app/app';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;

const server = Fastify({ logger: true });

server.register(app);

server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
