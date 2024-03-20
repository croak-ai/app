import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import superjson from "superjson";
import { getClerkOrgInfo } from "../../functions/clerk";
import { getDbAuthToken } from "../../functions/db";
import { createDbClient } from "packages/db";

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
  return next();
});

const isOrgDBConnected = t.middleware(({ next, ctx }) => {
  const clerkInfo = getClerkOrgInfo({ auth: ctx.auth });

  if (!clerkInfo) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Organization not found in the context.",
    });
  }

  const { tursoDbName, tursoGroupName, tursoOrgName } = clerkInfo;

  const url = `libsql://${tursoDbName}-${tursoOrgName}.turso.io`;
  const token = getDbAuthToken({
    env: ctx.env,
    groupName: tursoGroupName,
  });

  const db = createDbClient(url, token);

  const newContext = {
    ...ctx,
    db,
  };

  return next({
    ctx: newContext,
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
