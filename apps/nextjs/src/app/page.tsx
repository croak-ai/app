import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationListPage() {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/organization/:slug"
      afterSelectOrganizationUrl="/organization/:slug"
      hidePersonal={true}
    />
  );
}
