import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
//import db from "../db/client";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant.ts";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { getCountryInformation } from "../ai/functions/countryInformation";

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

      // console.log(run);

      //Check run status periodically
      // (Wait until assistant chooses a function for us to use, then run it)
      let status: string | null = null;
      let finalRunDetails: Run | null = null;
      while (status !== "requires_action" || finalRunDetails === null) {
        const runDetails = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );

        //console.log("RUN DETAILS HERE: \n\n", runDetails);

        status = runDetails.status;
        finalRunDetails = runDetails;
        // Introduce a 2-second delay before the next iteration
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2000 milliseconds (2 seconds)
      }
      // Grab tool call off run (function call)
      // const toolCalls = finalRunDetails
      //   ? finalRunDetails.required_action?.submit_tool_outputs.tool_calls
      //   : null;

      //console.log("RUN DETAILS HERE: \n\n", finalRunDetails);
      console.log("STATUS: ", status);
      const tool =
        finalRunDetails?.required_action?.submit_tool_outputs.tool_calls[0];

      if (!tool) {
        reply.send("Tool call sent back by openAI doesnt exist");
        return;
      }

      //This is how we will map string function names to actual functions

      // eslint-disable-next-line @typescript-eslint/ban-types
      const aiFunctionsByName: { [key: string]: Function } = {
        getCountryInformation,
      };

      //Get function ai wants
      const aiFunction = aiFunctionsByName[tool.function.name];

      if (!aiFunction) {
        reply.send(
          "AI is choosing a tool, however our json object is not matching it correctly",
        );
        return;
      }
      //Give assistant the results of our function it wanted
      const toolSubmit = await openai.beta.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        {
          tool_outputs: [
            {
              tool_call_id: tool?.id,
              output: aiFunction(JSON.parse(tool?.function.arguments)),
            },
          ],
        },
      );

      /* Now we must check the run status again until it is 
        complete and our response is waiting*/

      while (status !== "completed" && finalRunDetails !== null) {
        const runDetails = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );

        status = runDetails.status;
        finalRunDetails = runDetails;
      }

      // List the assistants response messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      //await client.sync();
      //const result = await client.execute("SELECT * FROM test");
      //reply.send("assistant should be running");
      reply.send(messages);
    },
  );
}
