"use client";

import { trpc } from "@next/app/_trpc/client";

export default function Bot() {
  const botRes = trpc.bot.chat.useQuery();
  return <>{botRes.data}</>;
}
