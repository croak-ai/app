import { router } from "./trpc";

import { createNewTursoDB } from "../routes/turso-meta/create-new-turso-db";
import { checkDBForOrg } from "../routes/turso-meta/check-db-for-org";
import { createWorkspace } from "../routes/workspace/create-workspace";
import { workspaceSlugExists } from "../routes/workspace/workspace-slug-exists";
import { getWorkspaceMemberships } from "../routes/workspace/get-workspace-memberships";
import { getAllWorkspaces } from "../routes/workspace/get-all-workspaces";
import { createChannel } from "../routes/channel/create-channel";
import { getWorkspaceChannels } from "../routes/channel/get-workspace-channels";
import { createMessage } from "../routes/message/create-message";

export const appRouter = router({
  createNewTursoDB,
  checkDBForOrg,
  createWorkspace,
  workspaceSlugExists,
  getWorkspaceMemberships,
  getAllWorkspaces,
  createChannel,
  getWorkspaceChannels,
  createMessage,
});

// export type definition of API
export type AppRouter = typeof appRouter;
