import { SignedInAuthObject, SignedOutAuthObject } from "@clerk/backend";

// So Clerk supports roles, but this is using an older version of Clerk that doesn't support roles.
// So we have to do this ourselves.
export const userHasRole = ({
  auth,
  role,
}: {
  auth: SignedInAuthObject | SignedOutAuthObject;
  role: string;
}): boolean => {
  try {
    const obj = JSON.parse(JSON.stringify(auth.sessionClaims));
    return obj.org_permissions?.includes(role) ?? false;
  } catch (e) {
    console.error("Invalid JSON provided");
    return false;
  }
};

interface getClerkInfoReturn {
  orgId: string;
  tursoGroupName: string;
  tursoDbName: string;
  tursoOrgName: string;
}

export const getClerkOrgInfo = ({
  auth,
}: {
  auth: SignedInAuthObject | SignedOutAuthObject;
}): getClerkInfoReturn | undefined => {
  const orgId = auth?.orgId;

  const sessionClaims = JSON.parse(JSON.stringify(auth.sessionClaims));

  const tursoGroupName =
    sessionClaims?.org_public_metadata?.main_database_turso_group_name;
  const tursoDbName =
    sessionClaims?.org_public_metadata?.main_database_turso_db_name;
  const tursoOrgName =
    sessionClaims?.org_public_metadata?.main_database_turso_org_name;

  if (!orgId || !tursoGroupName || !tursoDbName || !tursoOrgName) {
    return undefined;
  }

  return { orgId, tursoGroupName, tursoDbName, tursoOrgName };
};
