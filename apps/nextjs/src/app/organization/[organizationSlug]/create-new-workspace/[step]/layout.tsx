import { StepLayout } from "@acme/ui/components/steps/step-layout";

import { FirstTimeSteps } from "./components/first-time-steps";
import TopBar from "../../components/top-bar-without-workspace";

export default async function CreateNewSchoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { step: string };
}) {
  return (
    <TopBar>
      <StepLayout
        currentStep={Number(params.step)}
        numSteps={FirstTimeSteps.length}
      >
        {children}
      </StepLayout>
    </TopBar>
  );
}
