import { Button } from "@packages/ui/components/ui/button";

import { Suspense } from "react";
async function WorkspacePage() {
  return <></>;
}

export default async function Layout() {
  return (
    <Suspense fallback={<>SUSPENSE</>}>
      <WorkspacePage />
    </Suspense>
  );
}
