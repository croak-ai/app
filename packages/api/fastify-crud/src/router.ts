import { FastifyInstance } from "fastify";

import assistant from "./routes/assistant";
export default async function router(fastify: FastifyInstance) {
  fastify.register(assistant, { prefix: "/" });
}
