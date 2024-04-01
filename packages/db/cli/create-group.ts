import ora from "ora";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import chalk from "chalk";

export interface Group {
  archived: boolean;
  locations: string[];
  name: string;
  primary: string;
  uuid: string;
}

export async function createGroups({
  locationCodes,
  environment,
}: {
  locationCodes: string[];
  environment: string;
}) {
  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }

  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }
  const spinner = ora("Creating Groups").start();

  let num = 0;
  const createGroupPromises = locationCodes.map(async (locationCode) => {
    const name = `${environment}-${locationCode}`;
    const groupResponse = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          name: name,
          location: locationCode,
          extensions: ["vector", "vss", "fuzzy"],
        }),
      },
    );

    const group: any = await groupResponse.json();

    if (groupResponse.status !== 200) {
      console.error(` - Error message: ${JSON.stringify(group)}`);
      process.exit(1);
    }

    spinner.succeed(`Created Group: ${chalk.blue(name)}`);

    num++;
  });

  await Promise.all(createGroupPromises);

  spinner.stop();
  spinner.clear();

  console.log("Groups Created: " + chalk.blue(num));
}
