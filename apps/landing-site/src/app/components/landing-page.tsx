"use client";
import Link from "next/link";
import { CardContent, Card } from "@acme/ui/components/ui/card";
import { Title } from "./title";
import dynamic from "next/dynamic";

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
          <section className="w-full py-2 sm:py-24 ">
            <Title />
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Revolutionize Your Communication with Croak AI
                    </h1>
                    <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
                      Croak AI is an innovative communication app that leverages
                      AI and LLMs to enhance communication for businesses. Join
                      the waitlist for early access!
                    </p>
                  </div>
                  <div className="w-full max-w-sm space-y-2"></div>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full bg-gray-100 py-12 dark:bg-gray-800 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                    Testimonials
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    What People Are Saying
                  </h2>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <Card>
                  <CardContent>
                    <p className="text-lg font-semibold leading-snug lg:text-xl">
                      "Croak AI has transformed the way we communicate as a
                      team. It's a game changer."
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      - Jane Doe, CEO at TechCorp
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <p className="text-lg font-semibold leading-snug lg:text-xl">
                      "The AI features in Croak AI are truly innovative. It's
                      like having a personal assistant for communication."
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      - John Smith, Product Manager at InnovateTech
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Key Features
                </h2>
                <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the innovative features and functionalities of Croak
                  AI that set us apart from other communication apps.
                </p>
              </div>
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">AI-Powered</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Our AI technology enhances communication and productivity.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Easy to Use</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      User-friendly interface designed for seamless
                      communication.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Secure</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your data is safe with us. We prioritize security and
                      privacy.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
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
