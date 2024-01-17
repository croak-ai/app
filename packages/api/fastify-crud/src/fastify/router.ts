import { FastifyInstance } from "fastify";

import webhook from "./routes/webhook";
export default async function router(fastify: FastifyInstance) {
  fastify.register(webhook, { prefix: "/" });
}
