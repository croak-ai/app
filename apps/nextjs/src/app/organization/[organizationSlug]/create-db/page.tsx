import { Suspense } from "react";
import CreateDatabase from "./components/create-new-database";

export default async function Page({
  params,
}: {
  params: { organizationSlug: string };
}) {
  return (
    <>
      <Suspense fallback={<>Creating Database</>}>
        <CreateDatabase orgSlug={params.organizationSlug} />
      </Suspense>
    </>
  );
}
