import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { client } from "../db/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createAssistant";

export default async function postTest(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/test",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      const assistant = createOrRetrieveAssistant();
      //await client.sync();
      //const result = await client.execute("SELECT * FROM test");
      reply.send("assistant should have been created");
    },
  );
}
