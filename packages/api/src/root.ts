import { router } from "./trpc";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { botRouter } from "./router/bot";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  bot: botRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
