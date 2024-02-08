import { getServerTRPCClient } from "@/utils/trpc/serverTRPCClient";
import { cookies } from "next/headers";

import { Suspense } from "react";
import { OrgLayout } from "./(has-db-access)/components/org-layout";

export default async function Page({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { organizationSlug: string };
}) {
  const collapsibleLayoutValues = cookies().get(
    "react-resizable-panels:layout",
  );
  const collapsibleIsAICollapsed = cookies().get(
    "react-resizable-panels:collapsed",
  );

  const defaultCollapsibleLayoutValues: number[] = collapsibleLayoutValues
    ? JSON.parse(collapsibleLayoutValues.value)
    : [50, 25];

  const defaultCollapsibleIsAICollapsed: boolean =
    collapsibleIsAICollapsed && collapsibleIsAICollapsed.value !== "undefined"
      ? JSON.parse(collapsibleIsAICollapsed.value) === "true"
      : true;

  return (
    <Suspense fallback={<>SUIS</>}>
      <OrgLayout
        defaultCollapsibleIsAICollapsed={defaultCollapsibleIsAICollapsed}
        defaultCollapsibleLayoutValues={defaultCollapsibleLayoutValues}
        organizationSlug={params.organizationSlug}
      >
        {children}
      </OrgLayout>
    </Suspense>
  );
}
