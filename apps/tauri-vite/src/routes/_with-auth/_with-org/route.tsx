import OrgLayout from "@/routes/_with-auth/_with-org/-org-layout";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org")({
  beforeLoad: async ({ context }) => {
    const auth = context.auth;
    const user = context.user;

    if (!auth.orgSlug) {
      throw redirect({
        to: "/organization-selector",
        search: {
          redirect: location.href,
        },
      });
    }

    const matchingOrganizationMembership = user.organizationMemberships.find(
      (membership) => membership.organization.slug === auth.orgSlug,
    );
    if (!matchingOrganizationMembership) {
      throw new Error(
        "We couldn't find your organization membership. Please contact support.",
      );
    }

    if (
      !matchingOrganizationMembership.organization.publicMetadata
        .main_database_turso_org_name ||
      !matchingOrganizationMembership.organization.publicMetadata
        .main_database_turso_group_name ||
      !matchingOrganizationMembership.organization.publicMetadata
        .main_database_turso_db_name
    ) {
      throw redirect({
        to: "/onboard-new-org",
      });
    }
  },
  component: () => (
    <OrgLayout>
      <Outlet />
    </OrgLayout>
  ),
});
