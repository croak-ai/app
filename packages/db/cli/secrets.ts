import ora from "ora";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import chalk from "chalk";
import { Group } from "./create-group";
import { confirm, select } from "@inquirer/prompts";

export const invalidateSecretsInEnvironment = async ({
  environment,
}: {
  environment: string;
}) => {
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

export const createSecretsInEnvironment = async ({
  environment,
}: {
  environment: string;
}) => {
  console.log(chalk.blue("Creating Secrets for Environment: " + environment));
  const invalidateOldSecrets = await confirm({
    message: `Do you want to invalidate ${chalk.red(
      "ALL",
    )} old secrets for ${chalk.blue(
      environment,
    )} before creating new ones? ( recommended )`,
  });

  if (invalidateOldSecrets) {
    await invalidateSecretsInEnvironment({ environment });
  }

  const accessType = await select({
    message: "Select the access type for the secrets:",
    choices: [
      { name: "Full Access", value: "full-access" },
      { name: "Read Only", value: "read-only" },
    ],
  });

  const spinner = ora(
    `Creating Secrets for Environment: ${environment}`,
  ).start();

  const groupsResponse = await fetch(
    `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
      },
    },
  );

  const responseJson = await groupsResponse.json();
  const groups: Group[] = responseJson.groups;

  const environmentGroups = groups.filter((group) =>
    group.name.startsWith(environment),
  );

  const createSecretPromises = environmentGroups.map(async (group) => {
    const secretResponse = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups/${group.name}/auth/tokens?authorization=${accessType}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );

    if (secretResponse.status !== 200) {
      console.error(
        ` - Error creating secret for group ${group.name}: ${secretResponse.status}`,
      );
      process.exit(1);
    }

    const secret = await secretResponse.json();

    const jwt = secret.jwt;

    const secretName =
      group.name.replace(`${environment}-`, "").toUpperCase() + "_SECRET";
    return `${chalk.blue(secretName)}=${chalk.green(jwt)}`;
  });

  const secretsResults = await Promise.all(createSecretPromises);
  spinner.stop();
  spinner.clear();

  spinner.succeed(
    `${chalk.green(
      accessType.toUpperCase(),
    )} Secrets Created, Copy and Paste into .devs.var \n \n`,
  );
  console.log(
    `${chalk.blue("DB_ENVIORNMENT_LEVEL")}=${chalk.green(environment)}`,
  );
  secretsResults.forEach((result) => console.log(result + "\n"));
};
