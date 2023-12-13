import { FastifyInstance } from "fastify";

import bot from "./routes/bot";

export default async function router(fastify: FastifyInstance) {
  fastify.register(bot, { prefix: "/" });
}
