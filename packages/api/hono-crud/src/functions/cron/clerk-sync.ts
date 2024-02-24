import { Clerk } from "@clerk/backend";

export const clerkSync = async ({ apiKey }: { apiKey: string }) => {
  const clerk = Clerk({ apiKey: apiKey });
  const orgs = await clerk.organizations.getOrganizationList();
  console.log(orgs);
  return orgs;
};
