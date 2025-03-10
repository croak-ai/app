import { createFileRoute } from "@tanstack/react-router";
import CreateWorkSpaceForm from "./-components/create-workspace";
import { Protect } from "@clerk/clerk-react";

export const Route = createFileRoute("/_with-auth/_with-org/create-workspace")({
  component: CreateWorkspace,
});

function CreateWorkspace() {
  return (
    <Protect
      permission="org:workspace:create"
      fallback={<div>You Cannot Create a workspace</div>}
    >
      <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4">
        <div className="max-h-screen w-[50vh] overflow-auto py-12">
          <CreateWorkSpaceForm />
        </div>
      </div>
    </Protect>
  );
}
