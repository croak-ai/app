import { Separator } from "@acme/ui/components/ui/separator";
import { ForwardButton } from "@acme/ui/components/steps/forward-button";
import { BackwardButton } from "@acme/ui/components/steps/backward-button";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Button } from "@acme/ui/components/ui/button";
import { Suspense } from "react";
import { SkeletonButtonText } from "@acme/ui/components/skeleton/skeleton-button";
import CreateWorkSpaceForm from "./create-workspace-form";

export const StepSkeleton = () => {
  return (
    <>
      <ScrollArea className="w-full rounded-md  sm:h-full md:h-[500px] ">
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
  workspaceId: string;
  currentStep: number;
};

type StepFunction = (
  props: StepFunctionProps,
) => Promise<JSX.Element> | JSX.Element;

export const FirstTimeSteps: StepFunction[] = [
  async (props: StepFunctionProps) => {
    return (
      <>
        <CreateWorkSpaceForm currentStep={props.currentStep} />
      </>
    );
  },
  async (props: StepFunctionProps) => {
    return (
      <>
        <ScrollArea className="w-full rounded-md  sm:h-full md:h-[500px] ">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Configure Google Maps API. This can always be changed later in
                the admin settings.
              </h3>
              <p className="text-sm text-muted-foreground">
                Add a Google Maps API key to visualize geolocation data.
              </p>
            </div>
            <Separator />
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
        <ScrollArea className="w-full rounded-md  sm:h-full md:h-[500px] ">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Configure Canvas Developer Key Authorization. This can always be
                changed later in the admin settings.
              </h3>
              <p className="text-sm text-muted-foreground">
                To comply with Canvas API requirements, you can only have one
                user that is allowed to use the Canvas Developer Key. Add the
                email of the user you want to authorize below.
              </p>
            </div>
            <Separator />
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
        <ScrollArea className="w-full rounded-md  sm:h-full md:h-[500px] ">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">Finish Setup</h3>
              <p className="text-sm text-muted-foreground">
                Click "Continue To App" to complete your setup!
              </p>
            </div>
            <Separator />
            <div className="flex flex-col items-center">
              <CheckCircledIcon className="h-32 w-32 text-primary" />
              <p className="mt-4 text-center">
                You've Finished Setting Up Mark Me Here!
              </p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end py-4">
          <BackwardButton currentStep={props.currentStep} />
          <div className="ml-auto">FINISH HERE</div>
        </div>
      </>
    );
  },
];
