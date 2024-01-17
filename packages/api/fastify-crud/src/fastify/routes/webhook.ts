import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function assistant(fastify: FastifyInstance) {
  fastify.post(
    "/webhook",
    async function (request: FastifyRequest, reply: FastifyReply) {
      reply.send("Hello world!");
    },
  );
}
