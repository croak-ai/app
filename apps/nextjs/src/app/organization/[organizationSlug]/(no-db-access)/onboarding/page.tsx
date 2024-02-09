import { redirect } from "next/navigation";

export default function OrganizationListPage({
  params,
}: {
  params: { organizationSlug: string };
}) {
  redirect(`/organization/${params.organizationSlug}/onboarding/0`);
}
