import { Suspense } from "react";

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<>SUIS</>}>{children}</Suspense>;
}
