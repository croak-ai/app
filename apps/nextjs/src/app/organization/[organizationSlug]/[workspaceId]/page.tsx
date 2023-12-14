import { getServerTRPCClient } from "@next/utils/trpc/serverTRPCClient";
import { Button } from "@packages/ui/components/ui/button";

import { Suspense } from "react";
async function WokspacePage() {
  return (
    <>
      <Button className="w-full" />
    </>
  );
}

export default async function Layout() {
  return (
    <Suspense fallback={<>SUSPENSE</>}>
      <WokspacePage />
    </Suspense>
  );
}
