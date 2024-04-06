import { Clerk } from "@clerk/backend";

export interface OrgMetadata {
  main_database_turso_org_name: string;
  main_database_turso_group_name: string;
  main_database_turso_db_name: string;
  main_database_turso_db_url: string;
  main_database_turso_db_id: string;
}

export async function updateClerkOrgMetadataKV({
  clerkSecretKey,
  KV,
  organizationId,
}: {
  clerkSecretKey: string;
  KV: KVNamespace;
  organizationId: string;
}) {
  const clerkClient = Clerk({ secretKey: clerkSecretKey });

  const org = await clerkClient.organizations.getOrganization({
    organizationId,
  });

  if (!org.privateMetadata) {
    throw new Error("Organization public metadata is not available");
  }

  const {
    main_database_turso_org_name,
    main_database_turso_group_name,
    main_database_turso_db_name,
    main_database_turso_db_url,
    main_database_turso_db_id,
  } = org.privateMetadata as unknown as OrgMetadata;

  const orgMetadata: OrgMetadata = {
    main_database_turso_db_name,
    main_database_turso_org_name,
    main_database_turso_group_name,
    main_database_turso_db_url,
    main_database_turso_db_id,
  };

  // Assuming you want to save the fetched metadata back to KV for future use
  await KV.put(`org-metadata-${organizationId}`, JSON.stringify(orgMetadata), {
    expirationTtl: 86400,
  });
  return orgMetadata;
}

export async function getClerkOrgMetadata({
  organizationId,
  KV,
  clerkSecretKey,
}: {
  organizationId: string;
  KV: KVNamespace;
  clerkSecretKey: string;
}): Promise<OrgMetadata> {
  let metadata = await KV.get(`org-metadata-${organizationId}`);

  if (metadata) {
    return JSON.parse(metadata) as OrgMetadata;
  }

  const updatedMetadata = await updateClerkOrgMetadataKV({
    clerkSecretKey,
    KV,
    organizationId,
  });

  return updatedMetadata;
}
