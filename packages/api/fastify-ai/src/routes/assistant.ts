import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
//import db from "../db/client";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { query } from "../ai/functions/query";

type AssistantBody = {
  message: string;
};

export default async function assistant(fastify: FastifyInstance) {
  fastify.post(
    "/assistant",
    async function (
      request: FastifyRequest<{ Body: AssistantBody }>,
      reply: FastifyReply,
    ) {
      /* Could rebuild this to store assistant info in a single table instead of JSON */
      const assistant = await createOrRetrieveAssistant();

      const { message } = request.body;
      console.log("message: ", message);

      // Initialize a thread
      /* 
      We should be grabbing thread ID from request. If thread ID doesnt exist 
      we create a new thread and store it in the DB here
       */
      const thread = await openai.beta.threads.create();

      //Add message to thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message,
      });

      //Run the assistant with the thread we just created
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      /*
      CRUCIAL
      
      Here we need to handle the case of the ai deciding not to use a
      function to answer the question
      
      This run will return complete and we must act accordingly and send the response


      */
      //Check run status periodically
      // (Wait until assistant chooses a function for us to use, then run it)
      let status: string | null = null;
      let finalRunDetails: Run | null = null;
      while (status !== "requires_action" || finalRunDetails === null) {
        const runDetails = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );
        console.log(status);
        console.log("polling run1");
        status = runDetails.status;
        finalRunDetails = runDetails;
        // Introduce a 2-second delay before the next iteration
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2000 milliseconds (2 seconds)
      }

      const tool =
        finalRunDetails?.required_action?.submit_tool_outputs.tool_calls[0];

      if (!tool) {
        reply.send("Tool call sent back by openAI doesnt exist");
        return;
      }

      //This is how we will map string function names to actual functions
      // eslint-disable-next-line @typescript-eslint/ban-types
      const aiFunctionsByName: { [key: string]: Function } = {
        query,
      };

      //Get function ai chose
      const aiFunction = aiFunctionsByName[tool.function.name];

      if (!aiFunction) {
        reply.send(
          "AI is choosing a tool, however our json object is not matching it correctly",
        );
        return;
      }

      //Running our chosen function and feeding the results back to OpenAI
      const toolSubmit = await openai.beta.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        {
          tool_outputs: [
            {
              tool_call_id: tool?.id,
              output: await aiFunction(JSON.parse(tool?.function.arguments)),
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
        console.log("polling run2");
        status = runDetails.status;
        finalRunDetails = runDetails;

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      /* List the assistants response messages and send the latest */
      const messages = await openai.beta.threads.messages.list(thread.id);

      reply.send(messages.data[0]);
    },
  );
}
