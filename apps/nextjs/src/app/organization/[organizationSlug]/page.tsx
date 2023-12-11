import { Button } from "@acme/ui/components/ui/button";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: { organizationSlug: string };
}) {
  return (
    <>
      This is the organization page for {params.organizationSlug}
      Click{" "}
      <Link
        href={`/organization/${params.organizationSlug}/create-db`}
        className="text-primary underline"
      >
        this link
      </Link>{" "}
      <Button>asdasd</Button>
      to create the database if you haven't yet. This will be better implemented
      but it is 7am ok.{" "}
    </>
  );
}
