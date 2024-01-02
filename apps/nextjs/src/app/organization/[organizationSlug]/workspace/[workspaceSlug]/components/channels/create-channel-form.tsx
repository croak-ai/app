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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/components/ui/select";
import { useForm } from "react-hook-form";
import { ContinueButton } from "@acme/ui/components/bonus/continue-button";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { reactTRPC } from "@next/utils/trpc/reactTRPCClient";
import { zChannelTypes } from "@packages/db/enum";
import { redirect, useParams } from "next/navigation";

export default function CreateChannelForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const params = useParams<{
    workspaceSlug: string;
    organizationSlug: string;
  }>();

  const createChannel = reactTRPC.createChannel.createChannel.useMutation();

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    channelName: z.string().min(2).max(256, {
      message: "Channel name must be at most 256 characters.",
    }),

    type: zChannelTypes,

    channelDescription: z.string().min(2).max(512, {
      message: "Channel description must be at most 256 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!params?.workspaceSlug || !params?.organizationSlug) {
        setError(new Error("No workspace slug provided."));
        return;
      }

      setLoading(true);

      const newChannel = await createChannel.mutateAsync({
        zName: data.channelName,
        zChannelTypes: data.type,
        zDescription: data.channelDescription,
        zWorkspaceSlug: params.workspaceSlug, // replace with your actual variable
      });

      setLoading(false);

      if (newChannel) {
        redirect(
          `/organization/${params.organizationSlug}/workspace/${params.workspaceSlug}/channel/${newChannel.insertedId}/${newChannel.channelType}`,
        ); // replace with your actual variable
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="channelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Name</FormLabel>
                <FormControl>
                  <Input placeholder="General Chat" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name of your channel.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channelDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Name</FormLabel>
                <FormControl>
                  <Input placeholder="General Communications" {...field} />
                </FormControl>
                <FormDescription>
                  This is the description of your channel.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the Type of Channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This is the type of your channel.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            {loading ? (
              <Button disabled={true} variant={"outline"}>
                <Loading />
              </Button>
            ) : (
              <ContinueButton type="submit" />
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
