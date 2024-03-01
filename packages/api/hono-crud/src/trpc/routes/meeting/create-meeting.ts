import { meeting, meetingUserParticipant } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
type newMeetingType = typeof meeting.$inferInsert;
import { TRPCError } from "@trpc/server";
import { userHasRole } from "../../../functions/clerk";

export const zCreateMeeting = z.object({
  zName: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zScheduledStart: z.date(),
  zScheduledEnd: z.date(),
});

export const createMeeting = router({
  createMeeting: protectedProcedureWithOrgDB
    .input(zCreateMeeting)
    .mutation(async ({ ctx, input }) => {
      const newMeeting: newMeetingType = {
        name: input.zName,
        description: input.zDescription,
        scheduledStart: input.zScheduledStart.getTime(),
        scheduledEnd: input.zScheduledEnd.getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newMeetingRes = await ctx.db
        ?.insert(meeting)
        .values(newMeeting)
        .returning({
          insertedId: meeting.id,
        });

      const newlyCreatedMeeting = newMeetingRes[0];

      if (!newlyCreatedMeeting) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new meeting",
        });
      }

      await ctx.db?.insert(meetingUserParticipant).values({
        meetingId: newlyCreatedMeeting.insertedId,
        userId: ctx.auth.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return newlyCreatedMeeting;
    }),
});
