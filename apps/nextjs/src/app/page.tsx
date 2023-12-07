import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationListPage() {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/organization/:slug"
      afterSelectPersonalUrl="/user/:id"
      afterSelectOrganizationUrl="/organization/:slug"
    />
  );
}
