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
