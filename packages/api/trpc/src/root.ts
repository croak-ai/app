import { router } from "./trpc";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createNewTursoDB } from "./router/turso-meta/create-new-turso-db";
import { checkDBForOrg } from "./router/turso-meta/check-db-for-org";
import { createWorkspace } from "./router/workspace/create-workspace";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  createNewTursoDB: createNewTursoDB,
  checkDBForOrg: checkDBForOrg,
  createWorkspace: createWorkspace,
});

// export type definition of API
export type AppRouter = typeof appRouter;
