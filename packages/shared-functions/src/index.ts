export const getTursoDbUrlFromClerkTenantId = (
  tenantId: string,
  tursoOrgId: string,
) => {
  let dbName = tenantId;
  if (dbName.startsWith("org_")) {
    dbName = dbName.replace("org_", "t-").toLowerCase();
  } else {
    throw new Error("Invalid organization ID");
  }
  return `libsql://${dbName}-${tursoOrgId}.turso.io`;
};
