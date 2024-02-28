import { and, createDbClient, eq } from "@acme/db";
import { workspace, workspaceMember } from "@acme/db/schema/tenant";

interface WorkspacePermissionParams {
  bCanManageChannels?: boolean;
  bCanManageWorkspaceMembers?: boolean;
  bCanManageWorkspaceSettings?: boolean;
  workspaceSlug: string;
  userId: string;
  db: ReturnType<typeof createDbClient>;
}

export const getWorkspacePermission = async ({
  bCanManageChannels,
  bCanManageWorkspaceMembers,
  bCanManageWorkspaceSettings,
  workspaceSlug,
  userId,
  db,
}: WorkspacePermissionParams) => {
  try {
    const foundWorkspace = await db
      .select()
      .from(workspace)
      .where(eq(workspace.slug, workspaceSlug))
      .innerJoin(
        workspaceMember,
        and(
          eq(workspaceMember.userId, userId),
          eq(workspaceMember.workspaceId, workspace.id),
        ),
      );

    if (foundWorkspace.length !== 1 || !foundWorkspace[0]) {
      return { hasPermission: false, foundWorkspace: null };
    }

    const { workspaceMember: member } = foundWorkspace[0];

    const permissions = [
      { perm: member.bCanManageChannels, required: bCanManageChannels },
      {
        perm: member.bCanManageWorkspaceMembers,
        required: bCanManageWorkspaceMembers,
      },
      {
        perm: member.bCanManageWorkspaceSettings,
        required: bCanManageWorkspaceSettings,
      },
    ];

    const hasPermission = permissions.every(
      ({ perm, required }) => perm || !required,
    );

    return { hasPermission, foundWorkspace: foundWorkspace[0] };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
