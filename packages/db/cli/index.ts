import {
  input,
  select,
  checkbox,
  confirm,
  password,
  expand,
  editor,
  rawlist,
} from "@inquirer/prompts";
import migrateGroups from "./migrate";
import wipeGroups from "./wipe";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import chalk from "chalk";
import { Group, createGroups } from "./create-group";
import ora from "ora";
import { deleteGroups } from "./delete-group";
import execa from "execa";
interface LocationsResponse {
  locations: {
    [key: string]: string;
  };
}

interface LocationSelectorInput {
  locations: { [key: string]: string };
  disabledLocationCodes?: string[];
}
async function locationSelector({
  locations,
  disabledLocationCodes,
}: LocationSelectorInput) {
  const choices = Object.entries(locations).map(([key, value]) => ({
    name: key + " - " + value, // Display both name and key
    value: key, // Return the key
    disabled: disabledLocationCodes?.includes(key),
    disabledMessage: `Group already created`,
  }));

  const selectedLocations = await checkbox({
    message: "Select locations",
    choices,
  });

  return selectedLocations.map((location) => location.split(" - ")[0]);
}

async function getEnvironment() {
  const environment = await select({
    message: "Which Enviornment?",
    choices: [
      {
        name: "dev",
        value: "dev",
        description:
          "Creates secrets for dev enviornment for the selected groups.",
      },
      {
        name: "staging",
        value: "staging",
        description:
          "Creates secrets for staging enviornment for the selected groups.",
      },
      {
        name: "prod",
        value: "prod",
        description:
          "Creates secrets for prod enviornment for the selected groups.",
      },
    ],
  });

  return environment;
}

const getSelectedGroupNames = async (
  groups: Group[],
  { bBlockProdGroups = false },
): Promise<string[]> => {
  if (bBlockProdGroups) {
    const selectedGroups = await checkbox({
      message: "Select groups",
      choices: groups
        .filter((group) => !group.name.startsWith("prod-"))
        .map((group) => ({
          name: group.name,
          value: group.name,
        })),
    });

    return selectedGroups;
  }

  const doYouWantToFilterByEnvironment = await confirm({
    message: "Do you want to filter by environment?",
  });

  let availableGroups = groups;

  if (doYouWantToFilterByEnvironment) {
    const environment = await getEnvironment();

    availableGroups = groups.filter((group) =>
      group.name.includes(environment),
    );
  }

  if (availableGroups.length === 0) {
    console.log("No groups found for the selected environment");
    process.exit(0);
  }

  const selectedGroups = await checkbox({
    message: "Select groups",
    choices: availableGroups.map((group) => ({
      name: group.name,
      value: group.name,
    })),
  });

  const prodOrStagingGroups = selectedGroups.filter(
    (group) => group.includes("prod") || group.includes("staging"),
  );

  if (prodOrStagingGroups.length > 0) {
    const confirmRes = await confirm({
      message: "You have selected prod or staging groups. Are you sure?",
    });

    if (!confirmRes) {
      return getSelectedGroupNames(groups, { bBlockProdGroups });
    }
  }

  return selectedGroups;
};

const getGroups = async (): Promise<Group[]> => {
  const groupsResponse = await fetch(
    `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
      },
    },
  );

  const { groups }: { groups: Group[] } = await groupsResponse.json();
  return groups;
};

async function runTestInquirerScript() {
  if (!MIGRATIONS_TURSO_AUTH_TOKEN) {
    console.error("MIGRATIONS_TURSO_AUTH_TOKEN is not set");
    process.exit(1);
  }

  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    console.error("MIGRATIONS_TURSO_ORG_SLUG is not set");
    process.exit(1);
  }
  const spinner = ora("Getting Locations").start();

  const locationsResponse = await fetch(`https://api.turso.tech/v1/locations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
    },
  });
  const locations: LocationsResponse = await locationsResponse.json();

  spinner.text = "Getting Groups";
  const groups = await getGroups();
  spinner.stop();

  console.log(chalk.green("\n---------------------------------------------\n"));
  console.log("Groups: " + chalk.blue(groups.length));

  groups.forEach((group) => {
    console.log(
      `Name: ${chalk.blue(group.name)}\t\tPrimaryLocation: ${chalk.green(
        group.primary,
      )}\tAllLocations: ${chalk.gray(
        "{ " + group.locations.join(", ") + " }",
      )}`,
    );
  });

  const answer = await select({
    message: "What do you want to do?",
    choices: [
      {
        name: "Exit",
        value: "exit",
        description: "Leave the script.",
      },
      {
        name: "Generate",
        value: "generate",
        description: "Generates Drizzle Migrations meta JSON and SQL files.",
      },
      {
        name: "Migrate",
        value: "migrate",
        description: "Migrate the selected groups",
        disabled: groups.length === 0,
      },
      {
        name: "Wipe Group Data",
        value: "wipe",
        description: "Wipe data in all databases in the selected groups",
        disabled: groups.length === 0,
      },
      {
        name: "Create Secrets for Already Created Groups",
        value: "create-secrets-for-existing-groups",
        description: "Creates new secrets for groups that were already created",
        disabled: groups.length === 0,
      },
      {
        name: "Invalidate Group Secrets",
        value: "invalidate-secrets",
        description: "Invalidates Secrets for Selected Groups.",
        disabled: groups.length === 0,
      },
      {
        name: "Create Groups",
        value: "create",
        description: "Creates new groups and secrets for those groups.",
      },
      {
        name: "Delete Dev or Staging Groups",
        value: "delete",
        description: "Deletes groups. You can only delete dev groups.",
        disabled:
          groups.length === 0 ||
          !groups.some((group) => !group.name.startsWith("prod-")),
      },
    ],
  });

  if (answer === "exit") {
    process.exit(0);
  }

  if (answer === "generate") {
    console.log(
      "To Generate Drizzle Migrations meta JSON and SQL files, you need to run the following command in the root of the project:",
    );
    console.log(chalk.blue("pnpm db:generate"));
    process.exit(0);
  }

  if (answer === "migrate") {
    const migrateByEnv = await confirm({
      message: "Do you want to migrate groups by environment? (recommended)",
    });

    if (migrateByEnv) {
      const desiredEnv = await getEnvironment();

      const groupsToMigrate = groups.filter((group) =>
        group.name.startsWith(desiredEnv),
      );

      if (groupsToMigrate.length === 0) {
        console.log("No groups found for the selected environment");
        process.exit(0);
      }

      await migrateGroups({
        groupNames: groupsToMigrate.map((group) => group.name),
      });
    } else {
      const selectedGroups = await getSelectedGroupNames(groups, {
        bBlockProdGroups: false,
      });

      await migrateGroups({ groupNames: selectedGroups });
    }
  }

  if (answer === "wipe") {
    const selectedGroups = await getSelectedGroupNames(groups, {
      bBlockProdGroups: false,
    });

    await wipeGroups({ groupNames: selectedGroups });
  }

  if (answer === "create-secrets-for-existing-groups") {
    const selectedGroups = await getSelectedGroupNames(groups, {
      bBlockProdGroups: false,
    });

    const invalidateOldSecrets = await confirm({
      message: "Do you want to invalidate old secrets for these groups?",
    });
  }

  if (answer === "invalidate-secrets") {
    const selectedGroups = await getSelectedGroupNames(groups, {
      bBlockProdGroups: false,
    });
  }

  if (answer === "create") {
    const environment = await getEnvironment();

    const confirmMigration = await confirm({
      message: `Creating new groups in ${chalk.blue(
        environment,
      )} will force a migration in ${chalk.red(
        "all databases in " + environment,
      )}. Do you want to continue?`,
    });

    if (!confirmMigration) {
      process.exit(0);
    }

    const groupsAlreadyCreated = groups
      .filter((group) => group.name === `${environment}-${group.primary}`)
      .map((group) => group.primary);

    const selectedLocations = await locationSelector({
      locations: locations.locations,
      disabledLocationCodes: groupsAlreadyCreated,
    });

    if (selectedLocations.length === 0 || !selectedLocations) {
      console.log("No locations selected. Exiting");
      process.exit(0);
    }

    await createGroups({
      locationCodes: selectedLocations as string[],
      environment,
    });

    const delaySpinner = ora(
      "Waiting 5 seconds before starting migration",
    ).start();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    delaySpinner.stop();

    const refreshedGroups = await getGroups();

    const groupNamesInEnvironment = refreshedGroups
      .map((group) => group.name)
      .filter((group) => group.startsWith(environment));

    await migrateGroups({ groupNames: groupNamesInEnvironment });

    console.log(`Migrated all groups in ${chalk.blue(environment)}!`);
  }

  if (answer === "delete") {
    const confirmDelete = await confirm({
      message:
        "Are you sure you want to delete these groups and all of it's databases?",
    });

    if (!confirmDelete) {
      runTestInquirerScript();
    }

    const selectedGroups = await getSelectedGroupNames(groups, {
      bBlockProdGroups: true,
    });

    await deleteGroups({ groupNames: selectedGroups });
  }

  runTestInquirerScript();
}

runTestInquirerScript().catch(console.error);
