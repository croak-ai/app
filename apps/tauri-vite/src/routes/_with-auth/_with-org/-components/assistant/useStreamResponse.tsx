import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";

type Message = OpenAI.Beta.Threads.Messages.Message;
type Messages = Message[];

interface StreamResponseProps {
  setThreadId: (thread: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Messages>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useStreamResponse(Props: StreamResponseProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const currentTime = Date.now();
  /* Fetch response from AI server and initialize stream reader */
  const { mutate: startStream } = useMutation({
    mutationFn: async (body: string) => {
      setIsStreaming(true);
      const response = await fetch("http://localhost:3001/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
      const reader = response.body.getReader();
      return reader;
    },
    onSuccess: (reader) => {
      Props.setIsLoading(false);
      setIsStreaming(true);
      readStream(reader);
    },
  });

  /* 
  Recrusively read stream until done. Update state by continuously
  adding new text chunks to the last message in the array
  */
  async function readStream(reader: ReadableStreamDefaultReader) {
    let buffer = "";

    async function read() {
      const { done, value } = await reader.read();
      if (done) {
        setIsStreaming(false);
        return;
      }

      const text = new TextDecoder().decode(value);
      if (text.includes("END STREAM")) {
        const thread = JSON.parse(text.replace(/.*END STREAM/, ""));
        Props.setThreadId(thread.threadId);
      } else {
        buffer += text;
        const newMessage: Message = {
          id: Math.random().toString(),
          object: "thread.message",
          created_at: currentTime,
          thread_id: "",
          role: "assistant",
          content: [
            {
              type: "text",
              text: {
                value: buffer,
                annotations: [],
              },
            },
          ],
          file_ids: [],
          assistant_id: null,
          run_id: null,
          metadata: {},
          completed_at: currentTime,
          incomplete_at: currentTime,
          incomplete_details: null,
          status: "in_progress",
        };

        Props.setMessages((prevMessageArray) => {
          const newMessageArray = [...prevMessageArray];
          newMessageArray.pop();
          newMessageArray.push(newMessage);
          return newMessageArray;
        });
      }
      read();
    }
    read();
  }

  return { startStream, isStreaming };
}
