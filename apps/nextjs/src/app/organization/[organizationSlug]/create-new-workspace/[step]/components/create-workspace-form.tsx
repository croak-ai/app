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
import { Textarea } from "@acme/ui/components/ui/textarea";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { useEffect } from "react";
import { ScrollArea } from "@packages/ui/components/ui/scroll-area";

import ForwardButton from "@packages/ui/components/steps/forward-button";
import { Separator } from "@packages/ui/components/ui/separator";

import Lottie from "lottie-react";

import { successCheck } from "@acme/lottie-animations";
import { reactTRPC } from "@next/utils/trpc/reactTRPCClient";
import { Icons } from "@packages/ui/components/bonus/icons";
import { CrossCircledIcon } from "@radix-ui/react-icons";

export default function CreateWorkSpaceForm({
  currentStep,
  workspaceId,
}: {
  currentStep: number;
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const router = useRouter();

  const createWorkspace =
    reactTRPC.createWorkspace.createWorkspace.useMutation();

  const workspaceSlugExists =
    reactTRPC.workspaceSlugExists.workspaceSlugExists.useQuery(
      {
        zSlug: newWorkspaceSlug,
      },
      {
        enabled: newWorkspaceSlug?.length >= 2,
      },
    );

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    workspaceName: z
      .string()
      .min(2, {
        message: "Workspace Name must be at least 2 characters.",
      })
      .max(256)
      .transform((value) => value.trim())
      .refine(
        (value) => !value.includes("  "),
        "Workspace Name should not contain more than one space in a row.",
      ),

    workspaceSlug: z
      .string()
      .min(2, {
        message: "Workspace Slug must be at least 2 characters.",
      })
      .max(256)
      .trim(),

    workspaceDescription: z.string().min(2).max(512).trim(),
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
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    form.setValue("workspaceSlug", slug);
  }, [workspaceName]);

  const workspaceSlug = form.watch("workspaceSlug");

  // This is to basically to only run the query when the user stops typing
  useEffect(() => {
    form.clearErrors("workspaceSlug");

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = window.setTimeout(() => {
      setNewWorkspaceSlug(workspaceSlug);
      setTimeoutId(null);
    }, 750);

    setTimeoutId(id);
  }, [workspaceSlug]);

  useEffect(() => {
    if (workspaceSlugExists.data === true) {
      form.setError("workspaceSlug", {
        type: "manual",
        message: "Workspace slug already exists",
      });
    }

    if (workspaceSlugExists.data === false) {
      form.clearErrors("workspaceSlug");
    }
  }, [workspaceSlugExists.data, form]);

  const WorkspaceSlugIcon = () => {
    if (workspaceSlug?.length < 2 || timeoutId) {
      return <div className="h-6 w-6" />;
    }
    if (workspaceSlugExists.isFetching) {
      return <Icons.spinner className="h-6 w-6 animate-spin" />;
    }
    if (workspaceSlugExists.data === true) {
      return <Icons.crossCircled className="h-6 w-6 text-destructive" />;
    }

    if (workspaceSlugExists.data === false) {
      return <Icons.checkCircled className="h-6 w-6 text-primary" />;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    //const onSubmit = async () => {
    try {
      setLoading(true);

      const workspace = await createWorkspace.mutateAsync({
        zName: data.workspaceName,
        zSlug: data.workspaceSlug,
        zDescription: data.workspaceDescription,
      });

      if (workspace.length !== 1 || !workspace[0]?.insertedId) {
        setError(new Error("Something went wrong. Please try again."));
        return;
      }

      const id = workspace[0].insertedId;

      const url = new URL(window.location.href);

      url.searchParams.set("workspaceId", id.toString());

      router.replace(url.toString());
    } catch (e) {
      setError(e as Error);
    }
  };

  if (workspaceId) {
    return (
      <>
        <div className="w-full rounded-md  sm:h-full md:h-[650px]">
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-lg font-medium">
                Successfully Created Workspace!
              </h3>
            </div>
            <div className="flex justify-center">
              <Lottie
                animationData={successCheck}
                className="w-3/4"
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
      <ScrollArea className="w-full rounded-md  sm:h-full md:h-[650px]">
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
                      <div className="flex items-center">
                        <Input
                          placeholder="data-engineering"
                          {...field}
                          disabled
                        />
                        <span className="mx-4">
                          <WorkspaceSlugIcon />
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is your workspace slug, it must be unique:{" "}
                      <b>data-engineering</b>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workspaceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="This is the data engineering workspace, where we store all of our data engineering resources."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your workspace description
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
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              workspaceSlugExists.data === true ||
              workspaceSlugExists.isFetching ||
              timeoutId !== null
            }
          >
            Submit
          </Button>
        )}
      </div>
    </>
  );
}
