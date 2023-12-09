import { router } from "./trpc";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createNewTursoDB } from "./router/turso-meta/create-new-turso-db";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  createNewTursoDB: createNewTursoDB,
});

// export type definition of API
export type AppRouter = typeof appRouter;
