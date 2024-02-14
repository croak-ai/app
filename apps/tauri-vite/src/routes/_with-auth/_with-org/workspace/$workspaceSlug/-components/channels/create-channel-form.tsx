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
import { trpc } from "@/utils/trpc";
import { zChannelTypes } from "@acme/db/enum";
import { Textarea } from "@acme/ui/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";

export default function CreateChannelForm({
  takenChannelNames,
  onClose, // Add this line
}: {
  takenChannelNames?: string[];
  onClose?: () => void; // Define the type of the onClose prop
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { workspaceSlug } = useParams({ strict: false }) as {
    workspaceSlug: string;
  };
  const navigate = useNavigate({ from: "/workspace/$workspaceSlug" });

  const utils = trpc.useUtils();
  const createChannel = trpc.createChannel.createChannel.useMutation();

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    channelSlug: z
      .string()
      .min(2)
      .max(256, {
        message: "Channel name must be at most 256 characters.",
      })
      .refine((value) => /^[a-z0-9-]+$/.test(value), {
        message:
          "Channel name can only contain lowercase letters, numbers, and dashes.",
      })
      .refine((value) => !takenChannelNames?.includes(value), {
        message: "Channel name is already taken.",
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
      setLoading(true);

      const newChannel = await createChannel.mutateAsync({
        zSlug: data.channelSlug,
        zChannelTypes: data.type,
        zDescription: data.channelDescription,
        zWorkspaceSlug: workspaceSlug, // replace with your actual variable
      });

      await utils.getWorkspaceChannels.getWorkspaceChannels.invalidate();

      setLoading(false);

      onClose?.();

      if (newChannel) {
        navigate({
          to: "/workspace/$workspaceSlug/channel/$channelSlug",
          params: {
            channelSlug: newChannel.slug,
            workspaceSlug: workspaceSlug,
          },
        });
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
            name="channelSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="General Chat"
                    {...field}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\s/g, "-");
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Channel Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Engineering General Chat" {...field} />
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
