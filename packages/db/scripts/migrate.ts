import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  MIGRATIONS_TURSO_ORG_DB_GROUPS,
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} from "../env";
import { getEmptyDatabaseName } from "@acme/shared-functions";

async function migrateDatabase(db: {
  Name: string;
  Group: string;
  secret: string;
}) {
  const client = createClient({
    url: `libsql://${db.Name}-${MIGRATIONS_TURSO_ORG_SLUG}.turso.io`,
    authToken: db.secret,
  });

  await migrate(drizzle(client), {
    migrationsFolder: "./migrations",
  });

  console.log(`Tables migrated for ${db.Name} in the group ${db.Group}!`);
}

async function main() {
  try {
    if (
      !MIGRATIONS_TURSO_ORG_DB_GROUPS ||
      !MIGRATIONS_TURSO_ORG_SLUG ||
      !MIGRATIONS_TURSO_AUTH_TOKEN
    ) {
      throw new Error(
        "You haven't set up your environment variables correctly.",
      );
    }

    const response = await fetch(
      `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/databases`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
        },
      },
    );

    const { databases } = await response.json();

    const availableGroups = MIGRATIONS_TURSO_ORG_DB_GROUPS;

    const formattedDatabases: {
      Name: string;
      Group: string;
      secret: string;
    }[] = databases
      .map((db: any) => {
        const group = availableGroups.find(
          (group: any) => group.name === db.group,
        );
        if (!group) {
          return null;
        }
        return {
          Name: db.Name,
          Group: db.group,
          secret: group.secret,
        };
      })
      .filter(Boolean); // This will remove null values

    const filteredDatabases = formattedDatabases.filter(
      (db) =>
        availableGroups.some((group) => group.name === db.Group) &&
        db.Name.startsWith("t-"),
    );

    // Handle Creating Empty Databases
    // This is for when we have a new organization, it copies the tables from t-empty-${group.name}
    for (const group of availableGroups) {
      const emptyDatabaseName = getEmptyDatabaseName({ groupName: group.name });

      const groupHasEmptyDatabase = filteredDatabases.some(
        (db) => db.Group === group.name && db.Name === emptyDatabaseName,
      );

      if (!groupHasEmptyDatabase) {
        await fetch(
          `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/databases`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
            },
            body: JSON.stringify({
              name: emptyDatabaseName,
              group: group.name,
            }),
          },
        );

        console.log(
          `Created new ${emptyDatabaseName} database (this is for when we have a new organization, it copies the tables from t-empty)`,
        );

        console.log(
          `Waiting 1 second for the database to be created before we migrate it...`,
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Migrate the newly created empty database
        await migrateDatabase({
          Name: emptyDatabaseName,
          Group: group.name,
          secret: group.secret,
        });
      }
    }

    // Handle Migrations
    // We migrate all databases that start with t- (which includes t-empty-${group.name})
    if (filteredDatabases.length === 0) {
      console.log(
        "No databases to migrate! Make sure you configured your .env file correctly and that your databases are named correctly. (starting with a t-)",
      );
      process.exit(0);
    }

    await Promise.all(filteredDatabases.map((db) => migrateDatabase(db)));

    process.exit(0);
  } catch (error) {
    console.error("Error performing migration: ", error);
    process.exit(1);
  }
}

main();
