"use client";

import { Button } from "../ui/button";
import { CheckCircledIcon, CircleIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
const StepButton = ({
  step,
  numSteps,
  currentStep,
}: {
  step: number;
  numSteps: number;
  currentStep: number;
}) => {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams);

  const stepPassed = () => {
    return currentStep > step;
  };

  const selected = () => {
    return step === currentStep;
  };

  const lastStep = () => {
    return step === numSteps - 1;
  };

  return (
    <>
      <div>
        <Link
          href={step.toString() + "?" + params.toString()}
          style={{
            pointerEvents: !stepPassed() ? "none" : "auto",
          }}
        >
          <Button
            variant={
              selected() ? "secondary" : stepPassed() ? "default" : "ghost"
            }
            size="icon"
            className={""}
            disabled={!stepPassed()}
          >
            {stepPassed() ? (
              <CheckCircledIcon className="h-5 w-5" />
            ) : (
              <CircleIcon className="h-5 w-5" />
            )}
          </Button>
        </Link>
      </div>
      {!lastStep() && (
        <hr
          className={`mx-auto my-4 h-1 w-full  rounded border-0 md:my-10 ${
            stepPassed() ? "bg-primary" : "bg-secondary"
          }`}
        />
      )}
    </>
  );
};

export default StepButton;
