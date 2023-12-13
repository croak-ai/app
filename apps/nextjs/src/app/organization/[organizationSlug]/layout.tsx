import { getServerTRPCClient } from "@next/utils/trpc/serverTRPCClient";

import { Suspense } from "react";
async function EnsureOrg({ children }: { children: React.ReactNode }) {
  const tRPCClient = getServerTRPCClient();

  // Check to make sure the database exists
  const res = await tRPCClient.checkDBForOrg.checkDBForOrg.query();

  if (!res) {
    await tRPCClient.createNewTursoDB.createNewTursoDB.mutate();
  }

  return <>{children}</>;
}

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <EnsureOrg>{children}</EnsureOrg>
    </Suspense>
  );
}
