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
