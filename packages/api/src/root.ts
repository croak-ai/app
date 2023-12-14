import { router } from "./trpc";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createNewTursoDB } from "./router/turso-meta/create-new-turso-db";
import { botRouter } from "./router/bot";
import { checkDBForOrg } from "./router/turso-meta/check-db-for-org";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  createNewTursoDB: createNewTursoDB,
  bot: botRouter,
  checkDBForOrg: checkDBForOrg,
});

// export type definition of API
export type AppRouter = typeof appRouter;
