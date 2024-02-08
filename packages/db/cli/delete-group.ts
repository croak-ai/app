import ora from "ora";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import chalk from "chalk";

export async function deleteGroups({ groupNames }: { groupNames: string[] }) {
  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }

  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }
  let num = 0;
  const spinner = ora(`Deleting Groups`).start();

  const deleteGroupPromises = groupNames.map(async (groupName) => {
    if (groupName.startsWith("prod-")) {
      console.error(
        ` - Error: Cannot delete prod group: ${chalk.blue(groupName)}`,
      );
      process.exit(1);
    }
    const groupResponse = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups/${groupName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );

    const group: any = await groupResponse.json();

    if (groupResponse.status !== 200) {
      console.error(` - Error message: ${JSON.stringify(group)}`);
      process.exit(1);
    }

    console.log(` - Deleted Group: ${chalk.blue(groupName)}`);

    num++;
  });

  await Promise.all(deleteGroupPromises);

  spinner.stop();
  spinner.clear();

  console.log("Groups Deleted: " + num);

  return num;
}
