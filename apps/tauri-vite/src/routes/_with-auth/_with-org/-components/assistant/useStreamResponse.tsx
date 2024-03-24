import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";

type Message = OpenAI.Beta.Threads.Messages.Message;
type Messages = Message[];

function useStreamResponse({
  streamCallback,
}: {
  streamCallback: React.Dispatch<React.SetStateAction<Messages>>;
}) {
  const [message, setMessage] = useState<Message | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: startStream } = useMutation({
    mutationFn: async (body: string) => {
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
      setIsLoading(true);
      readStream(reader);
    },
  });

  async function readStream(reader: ReadableStreamDefaultReader) {
    async function read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false);
          return;
        }

        const text = new TextDecoder().decode(value);
        console.log("text: ", text);
        if (text.includes("END STREAM")) {
          setMessage(JSON.parse(text.replace(/.*END STREAM/, "")));
        } else {
          const currentTime = Date.now();

          const newMessage: Message = {
            id: "1",
            object: "thread.message",
            created_at: currentTime,
            thread_id: "",
            role: "user",
            content: [
              {
                type: "text",
                text: {
                  value: text,
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
          //setResponses((prev) => prev + text);
          //Replace last message in old array with new message and set new array state
          streamCallback((prevMessageArray) => {
            const newMessageArray = [...prevMessageArray];
            newMessageArray[newMessageArray.length - 1] = newMessage;
            return newMessageArray;
          });
        }
        read();
      } catch (e) {
        console.log(e);
      }
    }
    read();
  }

  return { message, startStream, isLoading };
}

export default useStreamResponse;
