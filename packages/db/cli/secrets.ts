import ora from "ora";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import chalk from "chalk";
import { Group } from "./create-group";

export const invalidateSecretsInEnvironment = async ({
  environment,
}: {
  environment: string;
}) => {
  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }

  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }
  let num = 0;

  const spinner = ora(`Getting Groups To Invalidate`).start();

  const gettingsGroupsResponse = await fetch(
    `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
      },
    },
  );

  const responseJson = await gettingsGroupsResponse.json();
  const groups: Group[] = responseJson.groups;

  const groupNames = groups
    .filter((group) => group.name.startsWith(environment))
    .map((group) => group.name);

  const invalidateSecretPromises = groupNames.map(async (groupName) => {
    if (groupName.startsWith("prod-")) {
      console.error(
        ` - Error: Cannot invalidate prod group: ${chalk.blue(groupName)}`,
      );
      process.exit(1);
    }
    const groupResponse = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups/${groupName}/auth/rotate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );

    const text = await groupResponse.text();

    if (groupResponse.status !== 200) {
      console.error(` - Error message: ${text}`);
      process.exit(1);
    }

    num++;
  });

  spinner.text = `Invalidating Secrets`;
  await Promise.all(invalidateSecretPromises);

  spinner.stop();
  spinner.clear();

  console.log(
    `Secrets Invalidated (${num}): ${chalk.green(groupNames.join(", "))}`,
  );
  return num;
};

export const createSecretsInEnvironment = async () => {};
