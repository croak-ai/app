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
import {
  MIGRATIONS_TURSO_ORG_DB_GROUPS,
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} from "../../env";
import chalk from "chalk";
import { Group, createGroups } from "./create-group";
import ora from "ora";
import { deleteGroups } from "./delete-group";
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

async function runTestInquirerScript() {
  if (!MIGRATIONS_TURSO_ORG_DB_GROUPS) {
    console.error("MIGRATIONS_TURSO_ORG_DB_GROUPS is not set");
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

  const groupsResponse = await fetch(
    `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
      },
    },
  );

  spinner.stop();

  const { groups }: { groups: Group[] } = await groupsResponse.json();

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
        name: "Delete Dev Groups",
        value: "delete",
        description: "Deletes groups. You can only delete dev groups.",
        disabled:
          groups.length === 0 ||
          !groups.some((group) => !group.name.startsWith("prod-")),
      },
      {
        name: "Exit",
        value: "exit",
        description: "Leave the script.",
      },
    ],
  });

  if (answer === "exit") {
    process.exit(0);
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
    const confirmMigration = await confirm({
      message:
        "Creating a new group will force a migration. Do you want to continue?",
    });

    if (!confirmMigration) {
      process.exit(0);
    }

    const environment = await getEnvironment();

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
      bBlockProdGroups: false,
    });

    await deleteGroups({ groupNames: selectedGroups });
  }

  runTestInquirerScript();
}

runTestInquirerScript().catch(console.error);
