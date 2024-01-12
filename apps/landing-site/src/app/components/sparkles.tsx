"use client";
import React from "react";
import { TypewriterEffectSmooth } from "@acme/ui/components/aceternity/typewriter-effect";
import { Input } from "@packages/ui/components/ui/input";
import { Button } from "@packages/ui/components/ui/button";

export function SparklesPreview() {
  const phrases = [
    {
      words: [
        { text: "No" },
        { text: "More" },
        { text: "Redudant" },
        { text: "Meetings", className: "text-primary" },
      ],
      duration: 1,
      showLines: true,
    },
    {
      words: [
        { text: "Always" },
        { text: "Know" },
        { text: "What's" },
        { text: "Happening" },
        { text: "In" },
        { text: "All", className: "text-primary" },
        { text: "Your" },
        { text: "Teams" },
      ],
      duration: 2,
    },
    {
      words: [{ text: "croak.ai", className: "text-primary" }],
      duration: 0.25,
      hideLine: true,
    },
  ];
  return (
    <div className="flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background">
      <div className=" relative z-10  mx-auto w-full max-w-4xl  p-4 pt-20 md:pt-0">
        <div className="flex items-center justify-center">
          <h1>
            <TypewriterEffectSmooth phrases={phrases} />{" "}
          </h1>
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
        we structure your communication data from the ground up to serve AI.
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
