"use client";

import { trpc } from "@next/app/_trpc/client";

export default function Bot() {
  const botRes = trpc.bot.createAssistant.useQuery();
  return <>{botRes.data}</>;
}
