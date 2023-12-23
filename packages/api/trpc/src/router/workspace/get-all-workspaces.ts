import {
  dekEncryptionKey,
  workspace,
  workspaceMember,
} from "@packages/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const getAllWorkspaces = router({
  getAllWorkspaces: protectedProcedureWithOrgDB.query(async ({ ctx }) => {
    const hasRole = await ctx.auth.has({
      permission: "org:workspace:all_access",
    });

    if (!hasRole) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have permission to create a workspace",
      });
    }

    const workspaceMemberships = await ctx.db?.select().from(workspace);

    return workspaceMemberships;
  }),
});
