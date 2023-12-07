import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import OpenAI from "openai";
//const openai = new OpenAI();
//const key = process.env.OPENAI_API_KEY;

export const botRouter = router({
  createAssistant: publicProcedure
    .input(z.string().nullish())
    .query(async ({ ctx }) => {
      console.log("WHATTTTT");
      // const completion = await openai.chat.completions.create({
      //   messages: [{ role: "system", content: "You are a helpful assistant." }],
      //   model: "gpt-3.5-turbo",
      // });
      return "not defined";
    }),
});
