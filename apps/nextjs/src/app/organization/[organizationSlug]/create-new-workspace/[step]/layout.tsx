import { StepLayout } from "@acme/ui/components/steps/step-layout";

import { FirstTimeSteps } from "./components/first-time-steps";

export default async function CreateNewSchoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { step: string };
}) {
  return (
    <StepLayout
      currentStep={Number(params.step)}
      numSteps={FirstTimeSteps.length}
    >
      {children}
    </StepLayout>
  );
}
