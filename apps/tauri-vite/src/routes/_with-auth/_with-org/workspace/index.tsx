import { Protect } from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace/")({
  component: WorkspaceIndexRoute,
});

const YouDontHaveAccess = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          You don't have any workspaces and you don't have permission to create
          a new one!
        </h2>
        <h2 className="text-2xl font-bold">
          Please contact your administrator.
        </h2>
      </div>
    </div>
  );
};

function WorkspaceIndexRoute() {
  const { workspacesData } = Route.useRouteContext();

  if (workspacesData.length === 0) {
    return (
      <div className=" flex h-screen items-center justify-center">
        <Protect
          permission="org:workspace:create"
          fallback={<YouDontHaveAccess />}
        >
          <Navigate to="/create-workspace" />
        </Protect>
      </div>
    );
  }

  return (
    <Navigate
      to={`/workspace/$workspaceSlug`}
      params={{ workspaceSlug: workspacesData[0].workspace.slug }}
    />
  );
}
