import { FastifyInstance } from "fastify";

import assistant from "./routes/assistant";
import summary from "./routes/summary";
export default async function router(fastify: FastifyInstance) {
  fastify.register(assistant, { prefix: "/" });
  fastify.register(summary, { prefix: "/" });
}
