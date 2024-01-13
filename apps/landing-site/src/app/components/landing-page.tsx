"use client";
import Link from "next/link";
import { CardContent, Card } from "@acme/ui/components/ui/card";
import { Title } from "./title";
import dynamic from "next/dynamic";
import { ThreeDCardDemo } from "./main-site-image-demo";

export default function Component() {
  const Meteors = dynamic(
    () => import("@acme/ui/components/aceternity/meteors"),
    { ssr: false }, // This line will disable server-side rendering for the component
  );

  return (
    <div className="relative overflow-x-hidden">
      <div className="flex min-h-screen flex-col">
        <Meteors number={20} />
        <main className="">
          <section className="w-full pt-2 sm:pt-24 ">
            <Title className="mt-52" />
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <ThreeDCardDemo />
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  About Croak AI
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Croak AI is a startup on a mission to revolutionize
                  communication with AI and LLMs. We believe in the power of
                  effective communication and are committed to providing
                  innovative solutions for businesses.
                </p>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © Croak AI. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:ml-auto sm:gap-6">
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              Twitter
            </Link>
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              LinkedIn
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
