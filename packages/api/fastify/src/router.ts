import { FastifyInstance } from "fastify";

import postTest from "./routes/postTest";
export default async function router(fastify: FastifyInstance) {
  fastify.register(postTest, { prefix: "/" });
}
