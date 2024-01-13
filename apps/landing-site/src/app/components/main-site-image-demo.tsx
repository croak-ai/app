"use client";

import Image from "next/image";
import React from "react";
import {
  CardBody,
  CardContainer,
  CardItem,
} from "@acme/ui/components/aceternity/3d-card";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative h-auto  w-auto rounded-xl border   border-white/[0.2] bg-black p-6 hover:shadow-2xl hover:shadow-emerald-500/[0.1] sm:w-[75rem]  ">
        <CardItem translateZ="100" className="mt-4 w-full">
          <Image
            src="/image.png"
            height="1920"
            width="1080"
            className=" w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
