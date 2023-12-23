"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";

export const BackwardButton = ({
  currentStep,
  disabled,
}: {
  currentStep: number;
  disabled?: boolean;
}) => {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams);

  return (
    <>
      <Link
        href={(currentStep - 1).toString() + "?" + params.toString()}
        style={{
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <Button disabled={disabled} variant={"outline"}>
          Go Back
        </Button>
      </Link>
    </>
  );
};
export default BackwardButton;
