import { router } from "./trpc";

import { createNewTursoDB } from "./router/turso-meta/create-new-turso-db";
import { checkDBForOrg } from "./router/turso-meta/check-db-for-org";
import { createWorkspace } from "./router/workspace/create-workspace";
import { workspaceSlugExists } from "./router/workspace/workspace-slug-exists";
import { getWorkspaceMemberships } from "./router/workspace/get-workspace-memberships";
import { getAllWorkspaces } from "./router/workspace/get-all-workspaces";

export const appRouter = router({
  createNewTursoDB: createNewTursoDB,
  checkDBForOrg: checkDBForOrg,
  createWorkspace: createWorkspace,
  workspaceSlugExists: workspaceSlugExists,
  getWorkspaceMemberships: getWorkspaceMemberships,
  getAllWorkspaces: getAllWorkspaces,
});

// export type definition of API
export type AppRouter = typeof appRouter;
