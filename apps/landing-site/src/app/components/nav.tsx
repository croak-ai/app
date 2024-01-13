"use client";
import React from "react";
import { FloatingNav } from "@acme/ui/components/aceternity/floating-navbar";
export default function FloatingNavDemo({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Contact",
      link: "/contact",
    },
  ];
  return (
    <div className="relative  w-full">
      <FloatingNav navItems={navItems} />
      {children}
    </div>
  );
}
