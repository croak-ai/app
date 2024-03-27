import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant";
import { query } from "../ai/functions/query";
import { Readable, PassThrough } from "stream";
import { ConsoleLogWriter } from "drizzle-orm";
import { read } from "fs";
import { threadId } from "worker_threads";
import {
  Message,
  MessageDelta,
} from "openai/resources/beta/threads/messages/messages";

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
      try {
        /* Could rebuild this to store assistant info in a single table instead of JSON */
        const assistant = await createOrRetrieveAssistant();

        const params = request.body;

        /* Retrieve thread based on value of threadId in body */
        const thread = await openai.beta.threads.retrieve(params.thread.id);

        //Add new message ot thread if the user did not create a new thread
        if (!params.thread.new) {
          await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: params.message,
          });
        }
        //Map string name to function call
        const aiFunctionsByName: { [key: string]: Function } = {
          query,
        };

        let functionName = "";
        let functionArgs = "";
        let functionId = "";
        let runId = "";
        let functionCall = false;

        const readableStream = new Readable();
        readableStream._read = () => {};

        const run = openai.beta.threads.runs
          .createAndStream(thread.id, {
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
                reply.send("Run ID not found");
                return;
              }
              //console.log("FUNCTION NAME:", functionName);
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
            if (event.event === "thread.run.requires_action") {
              functionArgs = JSON.parse(functionArgs);
              const aiFunction = aiFunctionsByName[functionName];
              if (!aiFunction) {
                reply.send(
                  "AI is choosing a tool, however our json object is not matching it correctly",
                );
                return;
              }
              const toolSubmitStream = openai.beta.threads.runs
                .submitToolOutputsStream(thread.id, runId, {
                  tool_outputs: [
                    {
                      tool_call_id: functionId,
                      output: await aiFunction(functionArgs),
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
                    // reply.send({ message: messageChunk, thread: thread });
                    readableStream.push(messageChunk);
                  }
                })
                .on("end", async () => {
                  readableStream.push("END STREAM");
                  reply.send({ threadId: thread.id });
                });
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
      }
    },
  );
}
