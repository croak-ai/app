/* Reusable assistant types */

export type AIMessage = {
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

export type UserMessage = {
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
