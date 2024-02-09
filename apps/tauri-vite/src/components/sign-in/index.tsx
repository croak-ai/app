import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "@/theme"; // If you're using Context
import { dark } from "@clerk/themes";

const SignInPage = () => {
  const { theme } = useTheme(); // If you're using Context

  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <h1 className="mb-4 py-48 text-4xl font-bold text-primary">
        Welcome to Croak
      </h1>
      <SignIn appearance={theme ? (dark as any) : undefined} />
    </div>
  );
};

export default SignInPage;
