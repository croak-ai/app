import Test from "./components/test";

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
