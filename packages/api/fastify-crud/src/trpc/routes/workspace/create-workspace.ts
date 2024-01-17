import {
  dekEncryptionKey,
  dekEncryptionKeyUserAccess,
  workspace,
  workspaceMember,
} from "@packages/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc/trpc";
import { z } from "zod";
type newWorkspaceType = typeof workspace.$inferInsert;
type newDEKEncryptionKeyType = typeof dekEncryptionKey.$inferInsert;
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

export const zCreateWorkspace = z.object({
  zName: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zSlug: z.string().min(2).max(256),
});

export const createWorkspace = router({
  createWorkspace: protectedProcedureWithOrgDB
    .input(zCreateWorkspace)
    .mutation(async ({ ctx, input }) => {
      const hasRole = await ctx.auth.has({
        permission: "org:workspace:create",
      });

      if (!hasRole) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to create a workspace",
        });
      }

      const key = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes * 8 = 128 bits
      const keyHex = Array.from(key)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const newDEKEncryptionKey: newDEKEncryptionKeyType = {
        dek: keyHex,
        kekType: "plaintext",
        kekId: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newDekEncryptionKeyRes = await ctx.db
        ?.insert(dekEncryptionKey)
        .values(newDEKEncryptionKey)
        .returning({ insertedId: dekEncryptionKey.id });

      if (
        newDekEncryptionKeyRes.length !== 1 ||
        !newDekEncryptionKeyRes ||
        !newDekEncryptionKeyRes[0]
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new DEK encryption key",
        });
      }

      const newWorkspace: newWorkspaceType = {
        name: input.zName,
        description: input.zDescription,
        slug: input.zSlug,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        publicChannelEncryptionId: newDekEncryptionKeyRes[0].insertedId,
      };

      const newWorkspaceRes = await ctx.db
        ?.insert(workspace)
        .values(newWorkspace)
        .returning({
          insertedId: workspace.id,
          insertedWorkspaceSlug: workspace.slug,
        });

      const newlyCreatedWorkspace = newWorkspaceRes[0];

      if (!newlyCreatedWorkspace) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new workspace",
        });
      }

      await ctx.db?.insert(workspaceMember).values({
        workspaceId: newlyCreatedWorkspace.insertedId,
        userId: ctx.auth.userId,
        bCanManageChannels: 1,
        bCanManageWorkspaceMembers: 1,
        bCanManageWorkspaceSettings: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const newDekEncryptionKey = newDekEncryptionKeyRes[0];

      await ctx.db?.insert(dekEncryptionKeyUserAccess).values({
        dekId: newDekEncryptionKey.insertedId,
        userId: ctx.auth.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return newlyCreatedWorkspace;
    }),
});
