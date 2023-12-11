import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationListPage() {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/organization/:slug/create-db"
      afterSelectPersonalUrl="/user/:id"
      afterSelectOrganizationUrl="/organization/:slug"
    />
  );
}
