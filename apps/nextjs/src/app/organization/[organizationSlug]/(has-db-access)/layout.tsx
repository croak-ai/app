import { Suspense } from "react";
import { getServerTRPCClient } from "@/utils/trpc/serverTRPCClient";

async function EnsureOrg({ children }: { children: React.ReactNode }) {
  const tRPCClient = getServerTRPCClient();

  // Check to make sure the database exists
  const res = await tRPCClient.checkDBForOrg.checkDBForOrg.query({} as any);

  if (!res) {
    await tRPCClient.createNewTursoDB.createNewTursoDB.mutate({} as any);
  }

  return <>{children}</>;
}

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>SUIS</>}>
      <EnsureOrg>{children}</EnsureOrg>
    </Suspense>
  );
}
