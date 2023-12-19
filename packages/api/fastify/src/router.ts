import { FastifyInstance } from "fastify";

import test from "./routes/test";

export default async function router(fastify: FastifyInstance) {
  fastify.register(test, { prefix: "/" });
}
