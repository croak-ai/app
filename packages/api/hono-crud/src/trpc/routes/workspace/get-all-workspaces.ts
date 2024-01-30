import {
  dekEncryptionKey,
  workspace,
  workspaceMember,
} from "@packages/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { userHasRole } from "../../../functions/clerk";

export const getAllWorkspaces = router({
  getAllWorkspaces: protectedProcedureWithOrgDB.query(async ({ ctx }) => {
    const hasRole = await userHasRole({
      auth: ctx.auth,
      role: "org:workspace:all_access",
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
