"use client";
import { cn } from "@next/utils/tailwindMerge";
import { Button } from "@next/components/ui/Button";
import { Input } from "@next/components/ui/Input";
import { useChat } from "ai/react";
import SuperJSON from "superjson";
import { useState } from "react";

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
  // other properties specific to user messages
};

type Message = AIMessage | UserMessage;

type Messages = Message[];

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Messages>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Store the users message in the state and return its content */
  function handleUserMessage() {
    const userMessage: Message = {
      id: "1",
      role: "user",
      content: [{ type: "text", text: { value: input, annotations: [] } }],
    };

    setInput("");
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    return userMessage.content[0]?.text.value;
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
      console.log("Server Response:", responseData);
      const latestMessage: Message = responseData[0];

      if (!latestMessage) {
        throw new Error("Latest message doesn't exist or is undefined");
      }
      setMessages((prevMessages) => [...prevMessages, latestMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center ">
      <div className="my-2 flex w-full grow flex-col gap-6 overflow-y-auto rounded-sm p-4 sm:my-10 sm:p-8">
        <div className="flex grow flex-col justify-start gap-4 overflow-y-scroll rounded-lg border-slate-400 pr-2">
          {messages.map(({ id, role, content }) => {
            console.log(role);
            return (
              <div
                key={id}
                className={cn(
                  "max-w-lg rounded-xl bg-gray-500 px-4 py-2 text-white",
                  role === "user" ? "self-start bg-green-600" : "self-end",
                )}
              >
                {content[0]?.text.value}
              </div>
            );
          })}
          {isLoading && (
            <>
              <div className="m-2 flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
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
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
