import { workspace, workspaceMember } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";

import { eq } from "drizzle-orm";

export const getWorkspaceMemberships = router({
  getWorkspaceMemberships: protectedProcedureWithOrgDB.query(
    async ({ ctx }) => {
      const workspaceMemberships = await ctx.db
        .select()
        .from(workspaceMember)
        .where(eq(workspaceMember.userId, ctx.auth.userId))
        .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId));

      return workspaceMemberships;
    },
  ),
});
