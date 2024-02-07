import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} from "../../env";
import { getEmptyDatabaseName } from "@acme/shared-functions";
import ora from "ora";
import chalk from "chalk";

export default async function migrateGroups({
  groupNames,
}: {
  groupNames: string[];
}) {
  // Make sure each group has an empty database

  const spinner = ora(`Starting Migration`).start();

  if (!MIGRATIONS_TURSO_ORG_SLUG) {
    spinner.fail(
      "MIGRATIONS_TURSO_ORG_SLUG is not set up correctly. Please check your .env file.",
    );
    process.exit(1);
  }

  if (!MIGRATIONS_TURSO_AUTH_TOKEN) {
    spinner.fail(
      "MIGRATIONS_TURSO_AUTH_TOKEN is not set up correctly. Please check your .env file.",
    );
    process.exit(1);
  }

  const tokensPromises = groupNames.map(async (groupName) => {
    const tokenResponse = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups/${groupName}/auth/tokens?expiration=3m`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );
    const jsonResponse = await tokenResponse.json();
    const token = jsonResponse.jwt;
    return { groupName, token: token as string };
  });

  spinner.text = "Generating 3 minute tokens for each group...";
  const groupsWithTokens = await Promise.all(tokensPromises);

  interface Database {
    DbId: string;
    Hostname: string;
    Name: string;
    group: string;
    primaryRegion: string;
    regions: string[];
    type: string;
    version: string;
  }

  const getDatabasesToMigrate = async (): Promise<Database[]> => {
    const response = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/databases`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );

    const { databases }: { databases: Database[] } = await response.json();
    return databases.filter((db) => groupNames.includes(db.group));
  };

  const databasesBeforeMigration = await getDatabasesToMigrate();
  spinner.text = "Migrating Empty Databases";

  async function migrateDatabase(db: { name: string; secret: string }) {
    const client = createClient({
      url: `libsql://${db.name}-${MIGRATIONS_TURSO_ORG_SLUG}.turso.io`,
      authToken: db.secret,
    });

    await migrate(drizzle(client), {
      migrationsFolder: "./migrations",
    });
    spinner.succeed(`Tables migrated for ${chalk.green(db.name)}.`);
  }

  for (const group of groupsWithTokens) {
    const emptyDatabaseName = getEmptyDatabaseName({
      groupName: group.groupName,
    });

    if (!databasesBeforeMigration.some((db) => db.Name === emptyDatabaseName)) {
      const response = await fetch(
        `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/databases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
          },
          body: JSON.stringify({
            name: emptyDatabaseName,
            group: group.groupName,
          }),
        },
      );

      if (response.status !== 200) {
        spinner.fail(
          `Failed to create empty database for ${
            group.groupName
          }. Error message: ${JSON.stringify(await response.json())}`,
        );
        process.exit(1);
      }

      console.log(
        `Created empty database for ${chalk.green(
          group.groupName,
        )}. This initalizes the group.`,
      );
    }

    await migrateDatabase({
      name: emptyDatabaseName,
      secret: group.token,
    });
  }

  spinner.succeed("Finished Migrating Empty Databases");

  const databases = await getDatabasesToMigrate();

  const nonEmptyDatabases = databases.filter(
    (db) => !db.Name.includes("empty"),
  );

  let isFirstGroup = true;

  for (const group of groupsWithTokens) {
    const databasesInGroup = nonEmptyDatabases.filter(
      (db) => db.group === group.groupName,
    );
    let isFirstDatabase = true;

    for (const database of databasesInGroup) {
      try {
        await migrateDatabase({
          name: database.Name,
          secret: group.token,
        });
      } catch (error) {
        // We only want to stop the process if it's the very first iteration of both loops
        if (isFirstGroup && isFirstDatabase) {
          throw error;
        }
        console.error(`Error migrating database ${database.Name}: ${error}`);
      }

      isFirstDatabase = false;
    }

    isFirstGroup = false;
  }

  spinner.succeed(chalk.green("Finished Migrating Databases"));
}
