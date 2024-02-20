import { router } from "../config/trpc";

import { createNewTursoDB } from "./turso-meta/create-new-turso-db";
import { checkDBForOrg } from "./turso-meta/check-db-for-org";
import { createWorkspace } from "./workspace/create-workspace";
import { workspaceSlugExists } from "./workspace/workspace-slug-exists";
import { getWorkspaceMemberships } from "./workspace/get-workspace-memberships";
import { getAllWorkspaces } from "./workspace/get-all-workspaces";
import { createChannel } from "./channel/create-channel";
import { getWorkspaceChannels } from "./channel/get-workspace-channels";
import { createMessage } from "./message/create-message";
import { getAvailableGroups } from "./turso-meta/get-available-groups";
import { getMessages } from "./message/get-messages";
import { getNewestMessage } from "./message/get-newest-message";

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
  getAvailableGroups,
  getMessages,
  getNewestMessage,
});

// export type definition of API
export type AppRouter = typeof appRouter;
