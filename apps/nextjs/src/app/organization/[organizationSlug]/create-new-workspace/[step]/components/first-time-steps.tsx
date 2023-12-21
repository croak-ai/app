import { Separator } from "@acme/ui/components/ui/separator";
import { ForwardButton } from "@acme/ui/components/steps/forward-button";
import { BackwardButton } from "@acme/ui/components/steps/backward-button";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { SkeletonButtonText } from "@acme/ui/components/skeleton/skeleton-button";
import CreateWorkSpaceForm from "./create-workspace-form";
import Link from "next/link";
import { ContinueButton } from "@packages/ui/components/bonus/continue-button";

export const StepSkeleton = () => {
  return (
    <>
      <ScrollArea className="w-full rounded-md  sm:h-full md:h-[650px] ">
        <div className="space-y-6 pb-6">
          <div>
            <h3 className="pb-2">
              <Skeleton className="h-6 w-[250px]" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-full" />
            </p>
          </div>
          <Separator />
        </div>
        <div className="pb-6">
          <Skeleton className="h-24 w-full " />
        </div>
        <div className="pb-6">
          <Skeleton className="h-16 w-[400px]" />
        </div>
        <Skeleton className="h-16 w-[400px]" />
      </ScrollArea>

      <div className="flex justify-end py-4">
        <SkeletonButtonText className="w-20" />

        <div className="ml-auto">
          <SkeletonButtonText className="w-20" />
        </div>
      </div>
    </>
  );
};

type StepFunctionProps = {
  organizationSlug: string;
  workspaceSlug: string;
  currentStep: number;
};

type StepFunction = (
  props: StepFunctionProps,
) => Promise<JSX.Element> | JSX.Element;

export const FirstTimeSteps: StepFunction[] = [
  async (props: StepFunctionProps) => {
    return (
      <>
        <CreateWorkSpaceForm
          currentStep={props.currentStep}
          createdWorkspaceSlug={props.workspaceSlug}
        />
      </>
    );
  },
  async (props: StepFunctionProps) => {
    return (
      <>
        <ScrollArea className="w-full rounded-md  sm:h-full md:h-[650px] ">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Add an Icon to Your Workspace
              </h3>
              <p className="text-sm text-muted-foreground">
                This will help you and your team identify the workspace.
              </p>
            </div>
            <Separator />
            WE WILL HAVE THE ICON UPLOAD HERE
          </div>
        </ScrollArea>
        <div className="flex justify-end py-4">
          <BackwardButton currentStep={props.currentStep} />
          <div className="ml-auto">
            <ForwardButton currentStep={props.currentStep} />
          </div>
        </div>
      </>
    );
  },
  async (props: StepFunctionProps) => {
    return (
      <>
        <ScrollArea className="w-full rounded-md  sm:h-full md:h-[650px] ">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Invite Other Members of Your Workspace!
              </h3>
              <p className="text-sm text-muted-foreground">
                It isn't a workspace without other people. Invite them to join.
              </p>
            </div>
            <Separator />
            WE WILL HAVE THE MEMBER TABLE HERE
          </div>
        </ScrollArea>
        <div className="flex justify-end py-4">
          <BackwardButton currentStep={props.currentStep} />
          <div className="ml-auto">
            <Link
              href={`/organization/${props.organizationSlug}/${props.workspaceSlug}`}
            >
              <ContinueButton name="Go To Workspace" />
            </Link>
          </div>
        </div>
      </>
    );
  },
];
