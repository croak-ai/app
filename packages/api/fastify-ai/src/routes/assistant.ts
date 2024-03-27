import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import openai from "../ai/client";
import { createOrRetrieveAssistant } from "../ai/helpers/createOrRetrieveAssistant";
import { query } from "../ai/functions/query";
import { Readable, PassThrough } from "stream";
import { ConsoleLogWriter } from "drizzle-orm";
import { read } from "fs";
import { threadId } from "worker_threads";

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
        let lastEvent = "";

        const readableStream = new Readable();
        readableStream._read = () => {};

        const run = openai.beta.threads.runs
          .createAndStream(thread.id, {
            assistant_id: assistant.id,
          })
          .on("textCreated", (text) => process.stdout.write("\nassistant => "))
          .on("textDelta", (textDelta, snapshot) =>
            // process.stdout.write(textDelta.value as string),
            console.log("textdelta"),
          )
          .on("toolCallCreated", (toolCall) => {
            if (toolCall.type === "function") {
              functionName = toolCall.function.name;
              functionId = toolCall.id;
              runId = run.currentRun()?.id as string;

              if (!runId) {
                reply.send("Run ID not found");
                return;
              }
              console.log("FUNCTION NAME:", functionName);
            }
          })
          .on("toolCallDelta", (toolCallDelta, snapshot) => {
            if (toolCallDelta.type === "function") {
              if (toolCallDelta.function?.arguments) {
                functionArgs += toolCallDelta.function.arguments;
                process.stdout.write(toolCallDelta.function.arguments);
              }
            }
          })
          .on("event", async (event) => {
            console.log("choosing tool event: ", event.event);
            console.log(runId);
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
                .on("event", (event) => {
                  //console.log("EVENT", event.event);
                })
                .on("messageDelta", (messageDelta, snapshot) => {
                  if (
                    messageDelta?.content &&
                    messageDelta.content[0]?.type === "text"
                  ) {
                    const messageChunk = messageDelta.content[0].text?.value;
                    process.stdout.write(messageChunk || " undefined ");
                    // reply.send({ message: messageChunk, thread: thread });
                    readableStream.push(messageChunk || "");
                  }
                })
                .on("end", async () => {
                  //reply.raw.write("END STREAM");
                  // const finalMessages = await run.finalMessages();
                  // reply.send({ data: finalMessages[0] });
                  readableStream.push("END STREAM");
                  reply.send({ message: "MESSAGGEEE", threadId: thread.id });
                });
            }
          });

        //reply.header("Content-Type", "application/json; charset=utf-8");
        // for await (const part of run) {
        //   reply.raw.write(JSON.stringify(part.data) || "");
        // }
        //return run;

        // const readableStream = new Readable();
        // async read() {
        //   for await (const chunk of run) {
        //     if (chunk.event === "thread.run.step.delta") {
        //       const h = chunk.data.delta.step_details as ToolCallDeltaObject;
        //       this.push(h?.tool_calls[0].function.arguments);
        //       console.log("ARGS: ", h?.tool_calls[0].function.arguments);
        //       //process.stdout.write(h?.tool_calls[0].function.arguments);
        //     }
        //   }
        // },

        // const readableStream = new Readable();
        // readableStream._read = function () {
        //   run.on("toolCallDelta", (toolCallDelta, snapshot) => {
        //     if (toolCallDelta.type === "function") {
        //       if (toolCallDelta.function?.arguments) {
        //         functionArgs += toolCallDelta.function.arguments;
        //         //process.stdout.write(toolCallDelta.function.arguments);
        //         //console.log("REPLY HIT");
        //         //console.log("ARGS: ", toolCallDelta.function.arguments);
        //         readableStream.push(toolCallDelta.function.arguments);
        //         //reply.send(JSON.stringify(functionArgs) || "");
        //         // reply.raw.write("AYY CUH");
        //       }
        //     }
        //   });
        // };

        reply.header("Content-Type", "application/json; charset=utf-8");
        return reply.send(readableStream);
      } catch (e) {
        console.log(e);
      }

      //await Bun.sleep(15000);

      /*
      CRUCIAL
      
      Here we need to handle the case of the ai deciding not to use a
      function to answer the question
      
      This run will return complete and we must act accordingly and send the response
      */

      //Check run status periodically
      // (Wait until assistant chooses a function for us to use, then run it)
      // let status: string | null = null;
      // let finalRunDetails: Run | null = null;
      // while (status !== "requires_action" || finalRunDetails === null) {
      //   const runDetails = await openai.beta.threads.runs.retrieve(
      //     thread.id,
      //     run.id,
      //   );
      //   console.log(status);
      //   console.log("polling run1");
      //   status = runDetails.status;
      //   finalRunDetails = runDetails;
      //   // Introduce a 2-second delay before the next iteration
      //   await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2000 milliseconds (2 seconds)
      // }

      // const tool =
      //   finalRunDetails?.required_action?.submit_tool_outputs.tool_calls[0];

      // if (!tool) {
      //   reply.send("Tool call sent back by openAI doesnt exist");
      //   return;
      // }

      //This is how we will map string function names to actual functions
      // eslint-disable-next-line @typescript-eslint/ban-types
      // const aiFunctionsByName: { [key: string]: Function } = {
      //   query,
      // };

      //Get function ai chose
      // const aiFunction = aiFunctionsByName[tool.function.name];

      // if (!aiFunction) {
      //   reply.send(
      //     "AI is choosing a tool, however our json object is not matching it correctly",
      //   );
      //   return;
      // }

      //Running our chosen function and feeding the results back to OpenAI
      // const toolSubmit = await openai.beta.threads.runs.submitToolOutputs(
      //   thread.id,
      //   run.id,
      //   {
      //     tool_outputs: [
      //       {
      //         tool_call_id: tool?.id,
      //         output: await aiFunction(JSON.parse(tool?.function.arguments)),
      //       },
      //     ],
      //   },
      // );

      /* 
      Now we must check the run status again until it is 
      complete and our response is waiting
      */
      // while (status !== "completed" && finalRunDetails !== null) {
      //   const runDetails = await openai.beta.threads.runs.retrieve(
      //     thread.id,
      //     run.id,
      //   );
      //   console.log("polling run2");
      //   status = runDetails.status;
      //   finalRunDetails = runDetails;

      //   await new Promise((resolve) => setTimeout(resolve, 2000));
      // }

      /* List the assistants response messages and send the latest */
      //const messages = await openai.beta.threads.messages.list(thread.id);
    },
  );
}
