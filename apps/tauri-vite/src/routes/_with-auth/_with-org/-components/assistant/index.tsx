"use client";
import { cn } from "@acme/ui/lib/utils";
import { Button } from "@acme/ui/components/ui/button";
import { Input } from "@acme/ui/components/ui/input";
import { useState } from "react";
import ChatBox from "./chat-box";
import NavBar from "./nav-bar";

export default function Assistant() {
  /* Query Assistant with given user message, add Assistant response message to state */

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div style={{ position: "relative", top: 0, left: "-300px" }}>
        OH FUCK
      </div>
      <NavBar />
      <ChatBox />
    </div>
  );
}
