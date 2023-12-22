import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
//import db from "../db/client";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant.ts";

export default async function postTest(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/test",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      const assistant = await createOrRetrieveAssistant();

      // Initialize a thread
      const thread = await openai.beta.threads.create();

      //Add message to thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Can you tell me what the capital city of Russia is?",
      });

      //Run the assistant with the thread we just created
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      //Check run status periodically
      let status = "";
      while (status != "completed") {
        const runDetails = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );

        status = runDetails.status;
      }
      // List the assistants response messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      //await client.sync();
      //const result = await client.execute("SELECT * FROM test");
      reply.send("assistant should have been created");
    },
  );
}
