import { z } from "zod";

const getTursoDbNameFromClerkTenantIdInput = z.object({
  tenantId: z.string(),
});

export const getTursoDbNameFromClerkTenantId = (
  input: z.infer<typeof getTursoDbNameFromClerkTenantIdInput>,
) => {
  const { tenantId } = getTursoDbNameFromClerkTenantIdInput.parse(input);
  let dbName = tenantId;
  if (dbName.startsWith("org_")) {
    dbName = dbName.replace("org_", "t-").toLowerCase();
  } else {
    throw new Error("Invalid organization ID");
  }
  return dbName;
};

const getTursoDbUrlFromClerkTenantIdInput = z.object({
  tenantId: z.string(),
  tursoOrgId: z.string(),
});

// This function is used to generate the database URL for a given tenant and organization.
// It uses the tenantId from clerk to get the database name using the function getTursoDbNameFromClerkTenantId.
// Finally, it constructs the database URL by appending the turso organization slug to the database name and adding the domain "turso.io".
// Example:
// tenantId: "org_1234567890"
// tursoOrgId: "acme"
// returns: "t-1234567890-acme.turso.io"

export const getTursoDbUrlFromClerkTenantId = (
  input: z.infer<typeof getTursoDbUrlFromClerkTenantIdInput>,
) => {
  const { tenantId, tursoOrgId } =
    getTursoDbUrlFromClerkTenantIdInput.parse(input);
  let dbName = getTursoDbNameFromClerkTenantId({ tenantId });
  return `${dbName}-${tursoOrgId}.turso.io`;
};

export const getEmptyDatabaseName = (group: { groupName: string }) => {
  return `t-empty-${group.groupName}`;
};

export function formatString(str: string): string {
  return str
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
