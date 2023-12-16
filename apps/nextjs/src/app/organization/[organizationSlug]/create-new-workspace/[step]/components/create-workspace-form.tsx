"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@acme/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/components/ui/form";
import { Input } from "@acme/ui/components/ui/input";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { useEffect } from "react";
import { ScrollArea } from "@packages/ui/components/ui/scroll-area";

import { redirect } from "next/navigation";
import ForwardButton from "@packages/ui/components/steps/forward-button";
import { Separator } from "@packages/ui/components/ui/separator";

import Lottie from "lottie-react";

import { successCheck } from "@acme/lottie-animations";

export default function CreateWorkSpaceForm({
  currentStep,
  workspaceId,
}: {
  currentStep: number;
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    workspaceName: z.string().min(2, {
      message: "workspaceName name must be at least 2 characters.",
    }),

    workspaceSlug: z.string().min(2, {
      message: "workspaceSlug must be at least 2 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const workspaceName = form.watch("workspaceName");

  useEffect(() => {
    if (!workspaceName) {
      form.setValue("workspaceSlug", "");
      return;
    }

    const slug = workspaceName
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    form.setValue("workspaceSlug", slug);
  }, [workspaceName]);

  //const onSubmit = async (data: z.infer<typeof formSchema>) => {
  const onSubmit = async () => {
    try {
      setLoading(true);

      const url = new URL(window.location.href);

      url.searchParams.set("workspaceId", "123");

      //
      if (true) {
        router.replace(url.toString());
      } else {
        setError(new Error("Something went wrong. Please try again."));
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  if (workspaceId) {
    return (
      <>
        <div className="w-full rounded-md  sm:h-full md:h-[500px]">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Successfully Created Workspace!
              </h3>
            </div>
            <div className="flex justify-center">
              <Lottie
                animationData={successCheck}
                className="w-1/2"
                loop={false}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end py-4">
          <ForwardButton currentStep={currentStep} />
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollArea className="w-full rounded-md  sm:h-full md:h-[500px]">
        <div className="space-y-6 pb-6">
          <div>
            <h3 className="text-lg font-medium">
              First Create your Workspace.
            </h3>
            <p className="text-sm text-muted-foreground">
              Your workspace is where you store some piece of your company's
              communcations. This could be a team, a mutual resource, or
              something else.
            </p>
          </div>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="workspaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Data Engineering" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your full Workspace name. For Example:{" "}
                      <b>Data Engineering</b>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workspaceSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="data-engineering"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      This is your workspace slug, it must be unique:{" "}
                      <b>data-engineering</b>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </ScrollArea>
      <div className="flex justify-end py-4">
        {loading ? (
          <Button disabled={true}>
            <Loading name="Submitting" />
          </Button>
        ) : (
          <Button type="submit" onClick={onSubmit}>
            Submit{" "}
          </Button>
        )}
      </div>
    </>
  );
}
