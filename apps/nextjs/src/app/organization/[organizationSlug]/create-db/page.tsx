import Test from "./components/create-new-database";

export default async function Page({
  params,
}: {
  params: { organizationSlug: string };
}) {
  return (
    <>
      <Test />
      {params.organizationSlug}
    </>
  );
}
