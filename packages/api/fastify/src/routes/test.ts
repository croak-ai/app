import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { drizzleClient } from "../index";
import { post } from "../../schema/post";

export default async function test(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/test",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      const result = await drizzleClient.select().from(post).all();
      reply.send("BLUZZO");
    },
  );
}
