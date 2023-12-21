"use client";

import { Suspense } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<>SUSPENSE</>}>{children}</Suspense>;
}
