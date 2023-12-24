import { redirect } from "next/navigation";

export const PageContent = async ({
  params,
}: {
  params: { organizationSlug: string; step: string };
}) => {
  redirect(`/organization/${params.organizationSlug}/workspace`);
};

export default PageContent;
