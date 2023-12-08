import { post } from "@packages/db/schema/post";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const postRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.select().from(post);
    console.log(tasks);
    return "YES";
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return "YES";
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      return "YES";
    }),
});
