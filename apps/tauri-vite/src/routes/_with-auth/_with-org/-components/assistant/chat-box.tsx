import { useMemo, useState } from "react";
import { trpc } from "@/utils/trpc";
import OpenAI from "openai";
import { useUser } from "@clerk/clerk-react";
import croakLogo from "@acme/ui/assets/croakLogo.png";
import useStreamResponse from "./useStreamResponse";
import Message from "../../workspace/$workspaceSlug/channel/$channelId/-components/message";
import { unified } from "unified";
import markdown from "remark-parse";
import { remarkToSlate, slateToRemark } from "remark-slate-transformer";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { createEditor } from "slate";
import SlateBox from "@/components/slate/slate-box";
import { Node } from "slate";
import { clearEditor, withMentions } from "@/components/slate/helpers";
import gfm from "remark-gfm";
import frontmatter from "remark-frontmatter";
import stringify from "remark-stringify";
import { MentionElement } from "@/components/slate/slate";

type Message = OpenAI.Beta.Threads.Messages.Message;
type Messages = Message[];
type MessageContentText = OpenAI.Beta.Threads.Messages.TextContentBlock;

interface ChatBoxProps {
  threadId: string;
  threadMessages: Messages;
  setThreadId: (thread: string) => void;
}

export default function ChatBox(Props: ChatBoxProps) {
  const [messages, setMessages] = useState<Messages>(Props.threadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const editor = useMemo(
    () => withMentions(withHistory(withReact(createEditor()))),
    [],
  );

  const { startStream, isStreaming } = useStreamResponse({
    setThreadId: Props.setThreadId,
    setMessages,
    setIsLoading,
  });
  const { user } = useUser();

  const toSlateProcessor = unified()
    .use(markdown)
    .use(gfm)
    .use(frontmatter)
    .use(remarkToSlate, {
      overrides: {
        inlineCode: (node, next) => {
          if (node.value.includes("userId=")) {
            const character = node.value.split("userId=")[1].trim();
            return {
              type: "mention",
              character,
              children: [{ text: character }],
            };
          }

          if (node.value.includes("epoch_sec=")) {
            const epoch_sec = node.value.split("epoch_sec=")[1].trim();
            return {
              type: "time",
              epoch_sec,
              children: [{ text: epoch_sec }],
            };
          }
        },
      },
    });
  const toRemarkProcessor = unified().use(stringify);

  const toSlate = (s: string) =>
    toSlateProcessor.processSync(s).result as Node[];

  const toMd = (value: Node[]) => {
    const mdast: any = toRemarkProcessor.runSync(
      slateToRemark(value, {
        overrides: {
          mention: (node: any, next) => {
            return {
              type: "inlineCode",
              value: ` userId=${node.character} `,
            };
          },
          time: (node: any, next) => {
            return {
              type: "inlineCode",
              value: ` epoch_sec=${node.epoch_sec} `,
            };
          },
        },
      }),
    );
    console.log(mdast);

    const ret = toRemarkProcessor.stringify(mdast);
    console.log(ret);
    return ret;
  };

  /* Create new thread in database and openai */
  const createThread = trpc.createThread.createThread.useMutation();

  /* Store userMessage and Initial assistant response message in state */
  function handleUserMessage({ message }: { message: string }) {
    setIsLoading(true);

    const currentTime = Date.now();
    const userMessage: Message = {
      id: Math.random().toString(),
      object: "thread.message",
      created_at: currentTime,
      thread_id: "",
      role: "user",
      content: [
        {
          type: "text",
          text: {
            value: message,
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

    const initialResponseMessage: Message = {
      id: "new",
      object: "thread.message",
      created_at: currentTime,
      thread_id: "",
      role: "assistant",
      content: [
        {
          type: "text",
          text: {
            value: "...",
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

    setMessages((prevMessages) => [
      initialResponseMessage,
      userMessage,
      ...prevMessages,
    ]);

    const messageContent = userMessage.content[0] as MessageContentText;
    return messageContent.text.value;
  }

  /* 
  Handle new messages, Create new thread in DB if needed, 
  begin streaming AI response 
  */
  async function handleSubmit() {
    if (isLoading || isStreaming) return;

    const mdMessage = toMd(editor.children);

    const message = handleUserMessage({ message: mdMessage });

    let newThreadId = "";
    if (Props.threadId === "new") {
      newThreadId = await createThread.mutateAsync({
        zMessage: message,
      });
      localStorage.setItem("threadId", newThreadId);
    }

    const body = JSON.stringify({
      message: message,
      thread: { id: newThreadId || Props.threadId, new: newThreadId },
    });

    clearEditor(editor);

    startStream(body);
  }

  const AssistantMessage = ({
    message,
    index,
  }: {
    message: Message;
    index: number;
  }) => {
    const { id, role, content, created_at } = message;
    const messageContent = content[0] as MessageContentText;

    const isUser = role === "user";

    const userId = isUser ? user?.id : undefined;
    const firstName = isUser ? user?.firstName : "Croak";
    const lastName = isUser ? user?.lastName : undefined;
    const imageUrl = isUser ? user?.imageUrl : croakLogo;
    //const imageUrl = undefined;
    const createdAt = created_at;
    const textMessage = messageContent.text.value;
    const processedMessage = toSlate(textMessage);

    const previousMessage = index > 0 ? messages[index - 1] : null;
    const previousUserId = previousMessage
      ? previousMessage.role === "user"
        ? user?.id
        : "assistant"
      : null;
    const previousCreatedAt = previousMessage
      ? previousMessage.created_at
      : null;

    let previousMessageUserId = undefined;

    if (previousMessage && previousUserId && previousCreatedAt) {
      previousMessageUserId = {
        userId: previousUserId,
        createdAt: previousCreatedAt,
      };
    }

    return (
      <Message
        key={id}
        message={{
          userId: userId || null,
          firstName: firstName,
          lastName: lastName,
          imageUrl: imageUrl,
          createdAt: createdAt,
          message: JSON.stringify(processedMessage),
        }}
        previousMessageUserId={previousMessageUserId}
      />
    );
  };

  return (
    <div className="flex w-full grow flex-col gap-6 overflow-y-auto rounded-sm p-2">
      <div className="flex grow flex-col flex-col-reverse justify-start gap-4 overflow-y-scroll rounded-lg border-slate-400 px-4 scrollbar-thin">
        {messages.map((message, index) => {
          if (message.role === "assistant") {
            return (
              <div className="rounded border px-4 pb-6">
                <AssistantMessage
                  key={message.id}
                  message={message}
                  index={index}
                />
              </div>
            );
          }
          return (
            <div className=" px-4 pb-6">
              <AssistantMessage
                key={message.id}
                message={message}
                index={index}
              />
            </div>
          );
        })}
      </div>
      <div className="playground-wrapper my-6">
        <SlateBox
          editor={editor}
          onSend={() => {
            handleSubmit();
          }}
          disabled={isLoading || isStreaming}
        />
      </div>
    </div>
  );
}
