import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant";
import { runDatabaseQuery } from "../ai/functions/runDatabaseQuery";
import { Readable, PassThrough } from "stream";
import { vectorQuery } from "../ai/functions/vectorQuery";

type AssistantBody = {
  message: string;
  thread: { id: string; new: boolean };
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

      const params = request.body;

      /* Retrieve thread based on value of threadId in body */
      const thread = await openai.beta.threads.retrieve(params.thread.id);

      //Add new message to thread if the user did not create a new thread
      if (!params.thread.new) {
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: params.message,
        });
      }
      //Map string name to function call
      const aiFunctionsByName: { [key: string]: Function } = {
        runDatabaseQuery,
      };

      let functionName = "";
      let functionArgs = "";
      let functionId = "";
      let runId = "";
      let functionCall = false;

      const readableStream = new Readable();
      readableStream._read = () => {};
      try {
        const run = openai.beta.threads.runs
          .stream(thread.id, {
            assistant_id: assistant.id,
          })
          .on("textDelta", (textDelta, snapshot) => {
            //process.stdout.write(textDelta.value as string)
            readableStream.push(textDelta.value);
          })

          .on("toolCallCreated", (toolCall) => {
            if (toolCall.type === "function") {
              functionCall = true;
              functionName = toolCall.function.name;
              functionId = toolCall.id;
              runId = run.currentRun()?.id as string;

              if (!runId) {
                readableStream.push("Run failed, please try again. END STREAM");
                return reply.send(readableStream);
              }
            }
          })
          /* Gather function arguments */
          .on("toolCallDelta", (toolCallDelta, snapshot) => {
            if (toolCallDelta.type === "function") {
              if (toolCallDelta.function?.arguments) {
                functionArgs += toolCallDelta.function.arguments;
                //process.stdout.write(toolCallDelta.function.arguments);
              }
            }
          })
          .on("event", async (event) => {
            //console.log("event ", event.event);
            //console.log(runId);
            try {
              if (event.event === "thread.run.requires_action") {
                console.log("Function Args: ", functionArgs);
                functionArgs = JSON.parse(functionArgs);
                console.log("Function Name: ", functionName);
                const aiFunction = aiFunctionsByName[functionName];
                if (!aiFunction) {
                  console.log("function failed");
                  await openai.beta.threads.runs.cancel(thread.id, runId);
                  readableStream.push(
                    "Run failed, Could not find AI function. please try again. END STREAM",
                  );
                  return;
                }

                const functionOutput = await aiFunction(functionArgs);

                const toolSubmitStream = openai.beta.threads.runs
                  .submitToolOutputsStream(thread.id, runId, {
                    tool_outputs: [
                      {
                        tool_call_id: functionId,
                        output: functionOutput,
                      },
                    ],
                  })
                  .on("messageDelta", (messageDelta, snapshot) => {
                    if (
                      messageDelta?.content &&
                      messageDelta.content[0]?.type === "text"
                    ) {
                      const messageChunk = messageDelta.content[0].text?.value;
                      //process.stdout.write(messageChunk || " undefined ");
                      readableStream.push(messageChunk);
                    }
                  })
                  .on("end", async () => {
                    readableStream.push("END STREAM");
                    reply.send({ threadId: thread.id });
                  });
              }
            } catch (e) {
              await openai.beta.threads.runs.cancel(thread.id, runId);
              readableStream.push("Run failed, please try again. END STREAM");
            }
          })
          .on("end", async () => {
            if (!functionCall) {
              readableStream.push("END STREAM");
              reply.send({ threadId: thread.id });
            }
          });

        reply.header("Content-Type", "application/json; charset=utf-8");
        return reply.send(readableStream);
      } catch (e) {
        console.log(e);
        await openai.beta.threads.runs.cancel(thread.id, runId);
        readableStream.push("Run failed, please try again. END STREAM");
      }
    },
  );
}
