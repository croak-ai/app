import React from "react";
import { Icons } from "./icons";

export const LoadingScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
};

export default LoadingScreen;
