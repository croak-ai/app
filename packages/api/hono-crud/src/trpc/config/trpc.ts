import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import superjson from "superjson";

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
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

const isOrgDBConnected = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.orgId) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No organization ID",
    });
  }

  if (!ctx.db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No DB connection",
    });
  }
  return next({
    ctx: {
      auth: ctx.auth,
      db: ctx.db,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const protectedProcedureWithOrgDB = t.procedure
  .use(isOrgDBConnected)
  .use(isAuthed);
