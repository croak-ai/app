import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import OpenAI from "openai";
const openai = new OpenAI();
//const key = process.env.OPENAI_API_KEY;

export const botRouter = router({
  createAssistant: publicProcedure
    .input(z.string().nullish())
    .query(async ({ ctx }) => {
      // const assistant = await openai.beta.assistants.create({
      //   name: "Math Tutor",
      //   instructions:
      //     "You are a personal math tutor. Write and run code to answer math questions.",
      //   tools: [{ type: "code_interpreter" }],
      //   model: "gpt-4-1106-preview",
      // });
      // return assistant;
      return "Hello";
    }),
});
