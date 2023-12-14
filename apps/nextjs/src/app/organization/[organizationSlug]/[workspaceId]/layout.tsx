"use client";

import { Suspense } from "react";
import { WorkspaceLayout } from "./components/top-bar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>SUSPENSE</>}>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </Suspense>
  );
}
