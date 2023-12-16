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
import { redirect } from "next/navigation";

export default function CreateWorkSpaceForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    channelSlug: z.string().min(2, {
      message: "Organization name must be at least 2 characters.",
    }),

    type: z.string().min(2, {
      message: "Email must be at least 2 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      if (true) {
        redirect(`/`);
      } else {
        setError(new Error("Something went wrong. Please try again."));
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
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="University Of Central Florida"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your full Organization name. For Example:{" "}
                  <b>University of Central Florida</b>
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
                    <SelectItem value="m@example.com">Text</SelectItem>
                    <SelectItem value="m@google.com">Canvas</SelectItem>
                    <SelectItem value="m@support.com">Tasks</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can manage verified email addresses in your
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
