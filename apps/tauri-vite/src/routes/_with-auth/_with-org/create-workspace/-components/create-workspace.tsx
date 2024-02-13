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

import { useForm } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { useEffect } from "react";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { Separator } from "@acme/ui/components/ui/separator";
import { Icons } from "@acme/ui/components/bonus/icons";
import { trpc } from "@/utils/trpc";

export default function CreateWorkSpaceForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const createWorkspace = trpc.createWorkspace.createWorkspace.useMutation();

  const workspaceSlugExists =
    trpc.workspaceSlugExists.workspaceSlugExists.useQuery(
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

      const { insertedWorkspaceSlug } = await createWorkspace.mutateAsync({
        zName: data.workspaceName,
        zSlug: data.workspaceSlug,
        zDescription: data.workspaceDescription,
      });
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-6">
        <div>
          <h3 className="text-lg font-medium">First Create your Workspace.</h3>
          <p className="text-sm text-muted-foreground">
            Your workspace is where you store some piece of your company's
            communcations. This could be a team, a mutual resource, or something
            else.
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
