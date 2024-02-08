import { protectedProcedure, router } from "../../config/trpc";

export const getAvailableGroups = router({
  getAvailableGroups: protectedProcedure.query(async ({ ctx }) => {
    const tursoToken = ctx.env.TRPC_TURSO_AUTH_TOKEN;

    if (!tursoToken) {
      throw new Error(
        "No TRPC_TURSO_AUTH_TOKEN. Make sure you configured your .env file correctly.",
      );
    }

    const [groupResponse, locationResponse] = await Promise.all([
      fetch(
        `https://api.turso.tech/v1/organizations/${ctx.env.TRPC_TURSO_ORG_SLUG}/groups`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tursoToken}`,
          },
        },
      ),
      fetch(`https://api.turso.tech/v1/locations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tursoToken}`,
        },
      }),
    ]);

    const groupData: {
      groups: Array<{
        name: string;
        primary: string;
      }>;
    } = await groupResponse.json();

    const locationData = (await locationResponse.json()) as {
      locations: {
        [key: string]: string;
      };
    };

    const environmentLevel = ctx.env.DB_ENVIORNMENT_LEVEL;

    const filteredGroups = groupData.groups.filter((group) =>
      group.name.startsWith(environmentLevel + "-"),
    );

    if (filteredGroups.length === 0) {
      throw new Error(
        `No groups found for environment level ${environmentLevel}.`,
      );
    }

    interface GroupWithLocation {
      name: string;
      primary: string;
      locationName: string;
    }

    const groupsWithLocations = filteredGroups.reduce<GroupWithLocation[]>(
      (acc, group) => {
        const locationName = locationData.locations[group.primary];
        const groupSecret = (ctx.env as any)[
          `${group.primary.toUpperCase()}_SECRET`
        ];
        if (locationName === undefined) {
          throw new Error(
            `location name for group ${group.name} is undefined.`,
          );
        }

        if (groupSecret === undefined) {
          throw new Error(`secret for group ${group.name} is undefined.`);
        }

        acc.push({
          ...group,
          locationName,
        });
        return acc;
      },
      [],
    );

    if (groupsWithLocations.length === 0) {
      throw new Error("No groups with valid locations and secrets found.");
    }

    return {
      availableGroups: groupsWithLocations,
    };
  }),
});
