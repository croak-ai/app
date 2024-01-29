"use client";
import React from "react";
import { TypewriterEffectSmooth } from "@acme/ui/components/aceternity/typewriter-effect";
import { Input } from "@acme/ui/components/ui/input";
import { Button } from "@acme/ui/components/ui/button";
import { cn } from "@packages/ui/lib/utils";

export function Title({ className }: { className?: string }) {
  const phrases = [
    {
      words: [
        { text: "No" },
        { text: "More" },
        { text: "Redudant", className: "text-primary" },
        { text: "Meetings" },
      ],
      duration: 1,
      showLines: true,
      className: "font-bold text-2xl lg:text-6xl",
    },
    {
      words: [
        { text: "Always" },
        { text: "Know" },
        { text: "What's" },
        { text: "Happening", className: "text-primary" },
        { text: "In" },
        { text: "All", className: "text-primary" },
        { text: "Teams" },
      ],
      duration: 2,
      className: "font-bold text-md md:text-xl lg:text-3xl xl:text-6xl",
    },
    {
      words: [
        { text: "10x" },
        { text: "Your" },
        { text: "Business'" },
        { text: "Productivity", className: "text-primary" },
      ],
      duration: 0.75,
      className: "font-bold text-xl lg:text-6xl ",
    },
    {
      words: [{ text: "croak.ai" }],
      duration: 0.25,
      className:
        "font-bold text-4xlrelative z-10 text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-green-200 to-green-600  text-center font-sans font-bold",
    },
  ];
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background",
        className,
      )}
    >
      <div className=" \ relative  z-10 mx-auto w-full  max-w-4xl p-4">
        <div className="flex h-[50px] items-end justify-center">
          <TypewriterEffectSmooth phrases={phrases} />{" "}
        </div>
      </div>
      <div className="relative w-[40rem]">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
        <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
        <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

        {/* Core component */}

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 h-full w-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
      <p className="mx-12 my-4 max-w-lg text-center text-base font-normal text-neutral-300">
        Using our <b>workspaces,</b> <b>text channels</b>, and <b>meetings</b>{" "}
        we structure your communication data from the ground up to securely
        serve AI.
      </p>
      <form className="flex space-x-2">
        <Input
          className="max-w-lg flex-1"
          placeholder="Enter your email"
          type="email"
        />
        <Button type="submit">Join Waitlist</Button>
      </form>
    </div>
  );
}
