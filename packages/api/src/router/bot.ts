import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const botRouter = router({
  createAssistant: publicProcedure
    .input(z.string().nullish())
    .query(({ ctx }) => {
      return "OpenAI assistant created";
    }),
});
