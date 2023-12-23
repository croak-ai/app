"use client";

import Link from "next/link";
import { ContinueButton } from "../bonus/continue-button";
import { useSearchParams } from "next/navigation";

export const ForwardButton = ({
  currentStep,
  disabled,
  text = "Next",
}: {
  currentStep: number;
  disabled?: boolean;
  text?: string;
}) => {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams);

  return (
    <>
      <Link
        href={(currentStep + 1).toString() + "?" + params.toString()}
        style={{
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <ContinueButton disabled={disabled} name={text} />
      </Link>
    </>
  );
};

export default ForwardButton;
