import "dotenv/config";
import { createClient } from "@libsql/client";
import {
  MIGRATIONS_TURSO_ORG_DB_GROUPS,
  MIGRATIONS_TURSO_ORG_SLUG,
  MIGRATIONS_TURSO_AUTH_TOKEN,
} from "../env";

async function dropTables(db: { Name: string; Group: string; secret: string }) {
  const client = createClient({
    url: `libsql://${db.Name}-${MIGRATIONS_TURSO_ORG_SLUG}.turso.io`,
    authToken: db.secret,
  });

  // Get a list of all tables
  const tablesResult = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table';`,
  );

  const tables = tablesResult.rows; // Assuming 'rows' is the iterable property containing table data

  // Generate and execute a DROP TABLE statement for each table
  for (const table of tables) {
    await client.execute(`DROP TABLE IF EXISTS ${table.name};`);
  }
  console.log(`All tables dropped for ${db.Name} in the group ${db.Group}!`);
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

    if (
      MIGRATIONS_TURSO_ORG_SLUG === "croak" ||
      MIGRATIONS_TURSO_ORG_SLUG === "croakai"
    ) {
      throw new Error(
        "You are trying to drop tables in a production environment. This is not allowed.",
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

    if (filteredDatabases.length === 0) {
      console.log(
        "No databases found for cleaning! Make sure you configured your .env file correctly and that your databases are named correctly. (starting with a t-)",
      );
      process.exit(0);
    }

    await Promise.all(filteredDatabases.map((db) => dropTables(db)));

    process.exit(0);
  } catch (error) {
    console.error("Error performing clean-up: ", error);
    process.exit(1);
  }
}

main();
