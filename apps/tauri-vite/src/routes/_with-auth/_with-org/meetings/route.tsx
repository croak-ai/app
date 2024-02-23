import { createFileRoute } from "@tanstack/react-router";
import { DailyProvider } from "@daily-co/daily-react";
import { useState } from "react";

export const Route = createFileRoute("/_with-auth/_with-org/meetings")();
