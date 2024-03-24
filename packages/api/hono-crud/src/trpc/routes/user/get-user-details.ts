import { user, workspace, workspaceMember } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { Column } from "@acme/db";

export const getUserDetails = router({
  getUserDetails: protectedProcedureWithOrgDB
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const signedInUserId = ctx.auth.userId; // Assuming ctx.auth.userId holds the signed-in user's ID

      const rawUserDetails = await ctx.db
        .select({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          email: user.email,
          role: user.role,
          workspaceId: workspace.id, // Mark workspace fields as nullable
          workspaceSlug: workspace.slug,
          workspaceName: workspace.name,
        })
        .from(user)
        .leftJoin(
          workspaceMember,
          and(
            eq(workspaceMember.userId, input.userId),
            sql`EXISTS(
          SELECT 1 
          FROM ${workspaceMember} wm2 
          WHERE wm2.workspaceId = ${workspaceMember.workspaceId} 
          AND wm2.userId = ${signedInUserId}
        )`,
          ),
        )
        .leftJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
        .where(eq(user.userId, input.userId))
        .execute();

      type WorkspaceDetail = {
        id: string;
        slug: string;
        name: string;
      };

      type UserDetail = {
        userId: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        createdAt: number;
        email: string;
        role: string;
        workspaces: WorkspaceDetail[];
      };

      const firstDetail = rawUserDetails[0];

      if (!firstDetail) {
        throw new Error("User not found");
      }

      const userDetails: UserDetail = {
        ...firstDetail,
        workspaces: [],
      };

      rawUserDetails.forEach((detail) => {
        if (
          detail.workspaceId &&
          detail.workspaceSlug &&
          detail.workspaceName
        ) {
          userDetails.workspaces.push({
            id: detail.workspaceId,
            slug: detail.workspaceSlug,
            name: detail.workspaceName,
          });
        }
      });

      return userDetails;
    }),
});
