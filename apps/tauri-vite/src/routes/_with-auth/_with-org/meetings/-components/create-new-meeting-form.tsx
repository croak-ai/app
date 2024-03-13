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
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";
import { useEffect } from "react";
import { Separator } from "@acme/ui/components/ui/separator";
import { Icons } from "@acme/ui/components/bonus/icons";
import { trpc } from "@/utils/trpc";
import { useNavigate } from "@tanstack/react-router";
import MeetingMemberList from "./meeting-member-list";
import { useUser } from "@clerk/clerk-react";
import { UserSearchCombobox } from "./select-users";

export default function CreateMeetingForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [meetingName, setMeetingName] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const { user } = useUser();

  if (!user) {
    return <></>;
  }

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
    meetingMembers: z.array(
      z.object({
        zFullName: z.string().optional(),
        zImageUrl: z.string().optional(),
        zUserId: z.string(),
        zRequired: z.boolean(),
        zHost: z.boolean(),
      }),
    ),
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
      meetingMembers: [
        {
          zUserId: user.id,
          zFullName: user.fullName ?? "Name Not Available",
          zImageUrl: user.imageUrl ?? "",
          zRequired: true,
          zHost: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "meetingMembers",
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
        zMeetingMembers: data.meetingMembers,
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
            <UserSearchCombobox
              existingUserIds={fields.map((field) => field.zUserId)}
              onSelect={(user) => {
                append({
                  zUserId: user.userId,
                  zFullName: `${user.firstName} ${user.lastName}`,
                  zImageUrl: user.imageUrl,
                  zRequired: false, // Set this based on your logic
                  zHost: false, // Set this based on your logic
                });
              }}
            />
            <FormField
              control={form.control}
              name="meetingMembers"
              render={({ field }) => (
                <>
                  <FormControl>
                    <MeetingMemberList
                      members={field.value.filter((member) => member.zRequired)}
                      onRemoveMember={(zUserId) =>
                        remove(
                          field.value.findIndex(
                            (member) => member.zUserId === zUserId,
                          ),
                        )
                      }
                    />
                  </FormControl>
                  {field.value.some((member) => !member.zRequired) && (
                    <FormControl>
                      <MeetingMemberList
                        members={field.value.filter(
                          (member) => !member.zRequired,
                        )}
                        onRemoveMember={(zUserId) =>
                          remove(
                            field.value.findIndex(
                              (member) => member.zUserId === zUserId,
                            ),
                          )
                        }
                      />
                    </FormControl>
                  )}
                </>
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
