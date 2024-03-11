import { meeting, meetingMember } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { eq } from "drizzle-orm";

export const getUserMeetings = router({
  getUserMeetings: protectedProcedureWithOrgDB.query(async ({ ctx, input }) => {
    ////////////////////////////////////////////////////////
    // Get the meetings

    const userId = ctx.auth.userId;
    console.log("ADS");

    const userMeetings = await ctx.db
      .select()
      .from(meetingMember)
      .innerJoin(meeting, eq(meeting.id, meetingMember.meetingId))
      .where(eq(meetingMember.userId, userId));

    console.log(userMeetings);

    return userMeetings;
  }),
});
