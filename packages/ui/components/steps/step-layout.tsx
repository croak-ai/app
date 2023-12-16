import { Card, CardFooter, CardHeader } from "../ui/card";
import StepButton from "./step-nav";
export function StepLayout({
  children,
  currentStep,
  numSteps,
}: {
  children: React.ReactNode;
  currentStep: number;
  numSteps: number;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="sm:w-full md:w-[90v] lg:w-[850px] ">
        <CardHeader>
          <div className="flex w-full items-center justify-between space-x-4">
            {Array.from({ length: numSteps }, (_, index) => (
              <StepButton
                key={index}
                step={index}
                currentStep={currentStep}
                numSteps={numSteps}
              />
            ))}
          </div>
          {children}
        </CardHeader>
      </Card>
    </div>
  );
}
