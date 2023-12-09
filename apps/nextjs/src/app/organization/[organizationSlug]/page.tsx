import Link from "next/link";

export default async function Page({
  params,
}: {
  params: { organizationSlug: string };
}) {
  return (
    <>
      <Link
        href={`/organization/${params.organizationSlug}/create-db`}
        style={{ color: "blue" }}
      >
        Create a new database
      </Link>
    </>
  );
}
