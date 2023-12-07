"use client";

import { trpc } from "@next/app/_trpc/client";

export default function Bot() {
  const botRes = trpc.bot.createAssistant.useQuery("yo");
  return <>{JSON.stringify(botRes)}</>;
}
