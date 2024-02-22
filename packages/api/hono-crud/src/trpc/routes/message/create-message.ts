import { channel, message } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";

export const zCreateMessage = z.object({
  channelId: z.string().min(1).max(256),
  workspaceSlug: z.string().min(2).max(256),
  messageContent: z.string().min(2).max(60000),
});

export const createMessage = router({
  createMessage: protectedProcedureWithOrgDB
    .input(zCreateMessage)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Check if user has permission to create a message in the channel

      const workspace = await getWorkspacePermission({
        workspaceSlug: input.workspaceSlug,
        userId: ctx.auth.userId,
        db: ctx.db,
      });

      if (!workspace.foundWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!workspace.hasPermission) {
        const hasRole = await userHasRole({
          auth: ctx.auth,
          role: "org:workspace:all_access",
        });

        if (!hasRole) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You do not have permission to create a message in this channel!",
          });
        }
      }

      ////////////////////////////////////////////////////////
      // Create the message
      //How should we get the conversation ID here????
      //Possibly load it into the context?
      //Possibly have to keep track of conversations client side (Could get messy)

      const currentTime = Date.now();

      const statement = sql`
      INSERT INTO message (userId, message, channelId, createdAt, updatedAt)
      VALUES (
          ${ctx.auth.userId},
          ${input.messageContent},
          ${input.channelId},
          ${currentTime},
          ${currentTime}
      )
      RETURNING id, message, channelId;
    `;

      const result = await ctx.db.run(statement);

      if (result.rowsAffected !== 1 || !result.rows || !result.rows[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new message",
        });
      }

      return result.rows[0];
    }),
});
