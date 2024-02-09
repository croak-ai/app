import { FirstTimeSteps, StepSkeleton } from "./components/first-time-steps";
import { Suspense } from "react";

export default async function Step({
  params,
}: {
  params: { organizationSlug: string; step: string };
}) {
  const GetStepFunction = async () => {
    const StepFunction = FirstTimeSteps[Number(params.step)];
    if (!StepFunction) {
      throw new Error("No Step Found");
    }
    return (
      <>
        <StepFunction
          organizationSlug={params.organizationSlug}
          currentStep={Number(params.step)}
        />
      </>
    );
  };

  return (
    <Suspense fallback={<StepSkeleton />}>
      <GetStepFunction />
    </Suspense>
  );
}
