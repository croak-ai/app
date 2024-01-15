import * as React from "react";
import ChatGPTDummy from "./chat-gpt-chat";

export function GPTCard() {
  return (
    <div className="">
      <div className=" relative h-3/4 w-3/4  max-w-sm md:h-1/2">
        <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
        <div className="relative flex h-full flex-col items-start  justify-end overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-4 py-8 shadow-xl">
          <h1 className="relative z-50 mb-4 text-center text-xl font-bold text-white">
            Chat GPT But With Your Most <b>Important</b> Data.
          </h1>

          <ChatGPTDummy />
        </div>
      </div>
    </div>
  );
}
