import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { drizzleClient } from "../index";
import { test } from "../db/schema/test";
import { client } from "../db/client";
import { sql } from "drizzle-orm";

export default async function postTest(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/test",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      await client.sync();
      const result = await client.execute("SELECT * FROM test");
      reply.send(result);
    },
  );
}
