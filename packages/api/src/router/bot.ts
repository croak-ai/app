import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const botRouter = router({
  chat: publicProcedure.input(z.string().nullish()).query(({ ctx }) => {
    return "bot chat route hit";
  }),
});
