import { meeting, meetingMember } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
type newMeetingType = typeof meeting.$inferInsert;
import { TRPCError } from "@trpc/server";
import { userHasRole } from "../../../functions/clerk";

const zMeetingMember = z.object({
  zUserId: z.string(),
  zRequired: z.boolean(),
  zHost: z.boolean(),
});

export const zCreateMeeting = z.object({
  zName: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zMeetingMembers: z
    .array(zMeetingMember)
    .refine((members) => members.some((member) => member.zHost), {
      message: "At least one host is required",
    }),
  zScheduledStart: z.date(),
  zScheduledEnd: z.date(),
});

export const createMeeting = router({
  createMeeting: protectedProcedureWithOrgDB
    .input(zCreateMeeting)
    .mutation(async ({ ctx, input }) => {
      const hasHost = input.zMeetingMembers.some((member) => member.zHost);
      if (!hasHost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one meeting member must be a host.",
        });
      }

      const newMeeting: newMeetingType = {
        name: input.zName,
        description: input.zDescription,
        scheduledStart: input.zScheduledStart.getTime() / 1000,
        scheduledEnd: input.zScheduledEnd.getTime() / 1000,
      };

      const newMeetingRes = await ctx.db
        ?.insert(meeting)
        .values(newMeeting)
        .returning({
          insertedId: meeting.id,
        });

      const newlyCreatedMeeting = newMeetingRes[0];

      if (!newlyCreatedMeeting || !newlyCreatedMeeting.insertedId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new meeting",
        });
      }

      const meetingMembers = input.zMeetingMembers.map((member) => {
        return {
          meetingId: newlyCreatedMeeting.insertedId,
          userId: member.zUserId,
          required: member.zRequired,
          host: member.zHost,
          createdAt: Date.now(), // Add this line
          updatedAt: Date.now(), // Add this line
        };
      });

      await ctx.db?.insert(meetingMember).values(meetingMembers);

      return newlyCreatedMeeting;
    }),
});
