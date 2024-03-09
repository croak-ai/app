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
import DateSelector from "@/routes/_with-auth/_with-org/meetings/-components/date-scheduler";
import { useForm } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { useEffect } from "react";
import { Separator } from "@acme/ui/components/ui/separator";
import { Icons } from "@acme/ui/components/bonus/icons";
import { trpc } from "@/utils/trpc";
import { useNavigate } from "@tanstack/react-router";

export default function CreateMeetingForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [meetingName, setMeetingName] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const navigate = useNavigate({ from: "/create-meeting" });

  const utils = trpc.useUtils();

  const createMeeting = trpc.createMeeting.createMeeting.useMutation();

  const meetingNameAvailable =
    trpc.meetingNameAvailable.meetingNameAvailable.useQuery(
      {
        zName: meetingName,
      },
      {
        enabled: meetingName?.length >= 2,
      },
    );

  if (error) {
    setLoading(false);
    throw error;
  }

  const formSchema = z.object({
    meetingName: z
      .string()
      .min(2, {
        message: "Meeting Name must be at least 2 characters.",
      })
      .max(256)
      .trim(),
    meetingDescription: z.string().min(2).max(512).trim(),
    meetingTime: z.object({
      from: z.date(),
      to: z.date(),
    }),
  });

  const interval = 30;

  const initialFrom = new Date();
  initialFrom.setMinutes(
    Math.ceil(initialFrom.getMinutes() / interval) * interval,
  );

  const initialTo = new Date(initialFrom);
  initialTo.setMinutes(initialTo.getMinutes() + interval);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      meetingTime: {
        from: initialFrom,
        to: initialTo,
      },
    },
  });

  useEffect(() => {
    form.clearErrors("meetingName");

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = window.setTimeout(() => {
      setMeetingName(form.getValues("meetingName"));
      setTimeoutId(null);
    }, 750);

    setTimeoutId(id);
  }, [form.watch("meetingName")]);

  useEffect(() => {
    if (meetingNameAvailable.data === false) {
      form.setError("meetingName", {
        type: "manual",
        message: "Meeting name already exists",
      });
    } else {
      form.clearErrors("meetingName");
    }
  }, [meetingNameAvailable.data, form]);

  const MeetingNameIcon = () => {
    if (timeoutId) {
      return <div className="h-6 w-6" />;
    }
    if (meetingNameAvailable.isFetching) {
      return <Icons.spinner className="h-6 w-6 animate-spin" />;
    }
    if (meetingNameAvailable.data === false) {
      return <Icons.crossCircled className="h-6 w-6 text-destructive" />;
    }

    if (meetingNameAvailable.data === true) {
      return <Icons.checkCircled className="h-6 w-6 text-primary" />;
    }

    return <div className="h-6 w-6" />;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      await createMeeting.mutateAsync({
        zName: data.meetingName,
        zDescription: data.meetingDescription,
        zScheduledStart: data.meetingTime.from,
        zScheduledEnd: data.meetingTime.to,
      });

      onCreated?.();

      //   utils.getMeetings.getMeetings.invalidate();

      //   navigate({ to: "/meetings" });
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <>
      Standup
      <div className="space-y-6 pb-6">
        <div>
          <h3 className="text-lg font-medium">Create a New Meeting.</h3>
          <p className="text-sm text-muted-foreground">
            Meetings are where your team collaborates. Make sure the meeting
            name is unique.
          </p>
        </div>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="meetingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input placeholder="Weekly Standup" {...field} />
                      <span className="mx-4">
                        <MeetingNameIcon />
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This is the name of your meeting. For Example:{" "}
                    <b>Weekly Standup</b>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meetingDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This is the weekly standup meeting for the team to sync on progress and blockers."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what this meeting is about.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meetingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Time</FormLabel>
                  <FormControl>
                    <DateSelector
                      value={{ from: field.value.from, to: field.value.to }}
                      onChange={(range) => field.onChange(range)}
                      minuteInterval={30}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Select the date and time range for the meeting.
                  </FormDescription>
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
              meetingNameAvailable.data === false ||
              meetingNameAvailable.isFetching ||
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
