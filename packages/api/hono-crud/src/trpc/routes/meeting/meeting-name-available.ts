import { meeting, recurringMeeting, workspace } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, like, or } from "drizzle-orm";

export const zMeetingInput = z.object({
  zName: z.string().min(1).max(256),
});

export const meetingNameAvailable = router({
  meetingNameAvailable: protectedProcedureWithOrgDB
    .input(zMeetingInput)
    .query(async ({ ctx, input }) => {
      const baseNameMatch = input.zName.match(/^(.*?)\s*\(/);

      let baseName = input.zName;

      if (baseNameMatch && baseNameMatch[1]) {
        baseName = baseNameMatch[1];
      }

      const meetingRes = await ctx.db
        .select()
        .from(meeting)
        .where(eq(meeting.name, input.zName));

      if (meetingRes.length > 0) {
        return false;
      }

      const recurringMeetingRes = await ctx.db
        .select()
        .from(recurringMeeting)
        .where(
          or(
            eq(recurringMeeting.name, input.zName),
            eq(recurringMeeting.name, baseName),
          ),
        );

      if (recurringMeetingRes.length > 0) {
        return false;
      }

      return true;
    }),
});
