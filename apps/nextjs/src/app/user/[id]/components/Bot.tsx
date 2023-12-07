"use client";

import { trpc } from "@next/app/_trpc/client";
// import { appRouter } from "@packages/api";
// console.log("router: ", typeof appRouter);

export default function Bot() {
  const botRes = trpc.bot.createAssistant.useQuery();
  return <>{JSON.stringify(botRes.data)} ayy</>;
}
