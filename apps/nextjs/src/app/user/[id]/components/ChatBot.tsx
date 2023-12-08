"use client";
import { cn } from "@next/utils/tailwindMerge";
import { Button } from "@next/components/ui/Button";
import { Input } from "@next/components/ui/Input";
//import { trpc } from "@next/app/_trpc/client";
// import { appRouter } from "@packages/api";
// console.log("router: ", typeof appRouter);

export default function ChatBot() {
  // const botRes = trpc.bot.createAssistant.useQuery();

  // const messages = ["Hello", "This is a bot"];
  const messages = [{ id: 1, role: "BOT", content: "Hello I am a chatbot" }];

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-center">
      <div className="my-2 flex w-full grow flex-col gap-6 overflow-y-auto rounded-sm p-4 sm:my-10 sm:border sm:p-8">
        <div className="flex grow flex-col justify-start gap-4 overflow-y-scroll rounded-lg border-slate-400 pr-2">
          {messages.map(({ id, role, content }) => (
            <div
              key={id}
              className={cn(
                "max-w-lg rounded-xl bg-gray-500 px-4 py-2 text-white",
                role === "user" ? "self-end bg-blue-600" : "self-start",
              )}
            >
              {content}
            </div>
          ))}
          {/* {isLoading && (
            <div className="dot-pulse m-6 self-start text-gray-500 before:text-gray-500 after:text-gray-500" />
          )} */}
          {messages.length === 0 && (
            <div className="flex grow items-center justify-center self-stretch">
              <svg
                className="opacity-10"
                width="150px"
                height="150px"
                version="1.1"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path d="m77.082 39.582h-29.164c-3.543 0-6.25 2.707-6.25 6.25v16.668c0 3.332 2.707 6.25 6.25 6.25h20.832l8.332 8.332v-8.332c3.543 0 6.25-2.918 6.25-6.25v-16.668c0-3.5391-2.707-6.25-6.25-6.25z" />
                  <path d="m52.082 25h-29.164c-3.543 0-6.25 2.707-6.25 6.25v16.668c0 3.332 2.707 6.25 6.25 6.25v8.332l8.332-8.332h6.25v-8.332c0-5.832 4.582-10.418 10.418-10.418h10.418v-4.168c-0.003907-3.543-2.7109-6.25-6.2539-6.25z" />
                </g>
              </svg>
            </div>
          )}
        </div>
        <form
          className="flex items-center gap-2 space-x-2"
          onSubmit={async (e) => {
            e.preventDefault();
            // if (!generateEmbedding) {
            //   throw new Error("Unable to generate embeddings");
            // }

            // const output = await generateEmbedding(input, {
            //   pooling: "mean",
            //   normalize: true,
            // });

            // const embedding = JSON.stringify(Array.from(output.data));

            // const {
            //   data: { session },
            // } = await supabase.auth.getSession();

            // if (!session) {
            //   return;
            // }

            handleSubmit(e, {
              options: {
                headers: {
                  authorization: `Bearer ${session.access_token}`,
                },
                body: {
                  embedding,
                },
              },
            });
          }}
        >
          <Input
            type="text"
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={!isReady}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
