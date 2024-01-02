import { router } from "./trpc";

import { createNewTursoDB } from "./router/turso-meta/create-new-turso-db";
import { checkDBForOrg } from "./router/turso-meta/check-db-for-org";
import { createWorkspace } from "./router/workspace/create-workspace";
import { workspaceSlugExists } from "./router/workspace/workspace-slug-exists";
import { getWorkspaceMemberships } from "./router/workspace/get-workspace-memberships";
import { getAllWorkspaces } from "./router/workspace/get-all-workspaces";
import { createChannel } from "./router/channel/create-channel";
import { getWorkspaceChannels } from "./router/channel/get-workspace-channels";

export const appRouter = router({
  createNewTursoDB,
  checkDBForOrg,
  createWorkspace,
  workspaceSlugExists,
  getWorkspaceMemberships,
  getAllWorkspaces,
  createChannel,
  getWorkspaceChannels,
});

// export type definition of API
export type AppRouter = typeof appRouter;
