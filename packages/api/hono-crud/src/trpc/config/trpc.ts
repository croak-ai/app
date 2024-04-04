import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import superjson from "superjson";
import { getDbAuthToken } from "../../functions/db";
import { createDbClient } from "@acme/db";
import { getClerkOrgMetadata } from "../../functions/clerk-org-metadata";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  // Update context with the new guaranteed userId
  const updatedCtx = { ...ctx, auth: { ...ctx.auth, userId: ctx.auth.userId } };
  return next({ ctx: updatedCtx });
});
const isOrgDBConnected = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.orgId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Organization ID not found in the context.",
    });
  }

  const clerkInfo = await getClerkOrgMetadata({
    organizationId: ctx.auth.orgId,
    KV: ctx.env.GLOBAL_KV,
    clerkSecretKey: ctx.env.CLERK_SECRET_KEY,
  });

  const { main_database_turso_db_url, main_database_turso_group_name } =
    clerkInfo;

  const token = getDbAuthToken({
    env: ctx.env,
    groupName: main_database_turso_group_name,
  });

  const db = createDbClient(main_database_turso_db_url, token);

  // Update context with the new guaranteed orgId
  const updatedCtx = {
    ...ctx,
    db,
    auth: { ...ctx.auth, orgId: ctx.auth.orgId },
  };

  return next({
    ctx: updatedCtx,
  });
});

const withDurableObject = t.middleware(async ({ ctx, next }) => {
  // Example: Use the authenticated user's ID as the unique identifier
  const orgId = ctx.auth.orgId;

  if (!orgId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Organization ID not found in the context.",
    });
  }

  // Generate a Durable Object ID from the user ID
  const durableObjectId = ctx.env.CROAK_DURABLE_OBJECT.idFromName(orgId);
  // Get a stub to the Durable Object
  const durableObjectStub = ctx.env.CROAK_DURABLE_OBJECT.get(durableObjectId);

  // Add the Durable Object stub to the context
  const newCtx = {
    ...ctx,
    durableObject: durableObjectStub,
  };

  // Proceed to the next middleware or procedure with the updated context
  return next({
    ctx: newCtx,
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const protectedProcedureWithOrgDB = t.procedure
  .use(isAuthed)
  .use(isOrgDBConnected);

export const protectedProcedureWithDurableObject = t.procedure
  .use(isAuthed)
  .use(isOrgDBConnected)
  .use(withDurableObject);
