"use client";
import { cn } from "@acme/ui/lib/utils";
import { Button } from "@acme/ui/components/ui/button";
import { Input } from "@acme/ui/components/ui/input";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import chat from "openai";
import OpenAI from "openai";

//Add these types to another file
type AIMessage = {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: string;
  content: {
    type: string;
    text: {
      value: string;
      annotations: string[];
    };
  }[];
  file_ids: string[];
  assistant_id: string;
  run_id: string;
  metadata: Record<string, string>;
};

type UserMessage = {
  id: string;
  role: string;
  content: {
    type: string;
    text: {
      value: string;
      annotations: string[];
    };
  }[];
};

type Message = OpenAI.Beta.Threads.Messages.ThreadMessage;

type Content = OpenAI.Beta.Threads.Messages.MessageContentText;

type Messages = Message[];

interface ChatBoxProps {
  activeThread: string;
}

export default function ChatBox(Props: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Messages>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* set all thread messages in state based on threadId */
  function setThreadMessages(thread: string) {
    //We need to figure out how to import the corretc openai type here
    const messages =
      trpc.retrieveThreadMessages.retrieveThreadMessages.useQuery({
        zThreadId: thread,
      });

    if (!messages.data) return [];

    setMessages(messages.data);
  }

  /* Store the users message in the state and return its content */
  function handleUserMessage() {
    const userMessage: Message = {
      id: "1",
      object: "thread.message",
      created_at: 12345,
      thread_id: "",
      role: "user",
      content: [
        {
          type: "text",
          text: {
            value: input,
            annotations: [],
          },
        },
      ],
      file_ids: [],
      assistant_id: "",
      run_id: "",
      metadata: {},
    };

    setInput("");
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    return userMessage.content[0].text.value;
  }

  /* Query Assistant with given user message, add Assistant response message to state */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const userMessage = handleUserMessage();

    const endpoint = "http://localhost:3001/assistant";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("HTTP status code out of successful range");
      }

      const responseData = await response.json();
      const latestMessage: Message = responseData[0];

      if (!latestMessage) {
        throw new Error("Latest message doesn't exist or is undefined");
      }
      setMessages((prevMessages) => [...prevMessages, latestMessage]);
    } catch (error) {
      //Error handling here in future
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full grow flex-col gap-6 overflow-y-auto rounded-sm p-4 sm:p-8">
      <div className="flex grow flex-col justify-start gap-4 overflow-y-scroll rounded-lg border-slate-400 pr-2">
        {messages.map(({ id, role, content }) => {
          return (
            <div
              key={id}
              className={cn(
                "max-w-lg  rounded-xl bg-gray-500 px-4 py-2 text-white [overflow-wrap:anywhere]",
                role === "user" ? "self-start bg-primary" : "self-end",
              )}
            >
              {content[0]?.text.value}
            </div>
          );
        })}
        {isLoading && (
          <>
            <div className="m-2 flex space-x-1 self-end">
              <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
            </div>
          </>
        )}
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
        onSubmit={handleSubmit}
        className="flex items-center gap-2 space-x-2"
      >
        <Input
          type="text"
          autoFocus
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit">
          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline h-6 w-6 animate-spin fill-black text-white dark:fill-white dark:text-black"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div className="text-md text-white">Send</div>
          )}
        </Button>
      </form>
    </div>
  );
}
