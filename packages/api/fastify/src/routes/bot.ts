import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function bot(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/test",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      reply.send("AYY BLUZZIN");
    },
  );
}
