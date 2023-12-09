import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  MIGRATIONS_TURSO_ORG_DB_GROUPS,
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_API_BASE_URL,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} from "./env";

async function main() {
  try {
    if (
      !MIGRATIONS_TURSO_ORG_DB_GROUPS ||
      !MIGRATIONS_TURSO_ORG_SLUG ||
      !MIGRATIONS_TURSO_API_BASE_URL ||
      !MIGRATIONS_TURSO_AUTH_TOKEN
    ) {
      throw new Error(
        "You haven't set up your environment variables correctly.",
      );
    }

    const response = await fetch(
      `${MIGRATIONS_TURSO_API_BASE_URL}/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/databases`,
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

    if (filteredDatabases.length === 0) {
      console.log(
        "No databases to migrate! Make sure you configured your .env file correctly and that your databases are named correctly. (starting with a t-)",
      );
      process.exit(0);
    }

    for (const db of filteredDatabases) {
      const client = createClient({
        url: `libsql://${db.Name}-${MIGRATIONS_TURSO_ORG_SLUG}.turso.io`,
        authToken: db.secret,
      });

      await migrate(drizzle(client), {
        migrationsFolder: "./migrations",
      });

      console.log(`Tables migrated for ${db.Name} in the group ${db.Group}!`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error performing migration: ", error);
    process.exit(1);
  }
}

main();
