import "dotenv/config";
import { createClient } from "@libsql/client";
import { MIGRATIONS_TURSO_ORG_SLUG, MIGRATIONS_TURSO_AUTH_TOKEN } from "../env";
import ora from "ora";

async function cleanTables(db: {
  Name: string;
  Group: string;
  secret: string;
}) {
  const client = createClient({
    url: `libsql://${db.Name}-${MIGRATIONS_TURSO_ORG_SLUG}.turso.io`,
    authToken: db.secret,
  });

  // Get a list of all tables
  const tablesResult = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table';`,
  );

  const tables = tablesResult.rows; // Assuming 'rows' is the iterable property containing table data

  // Generate and execute a DELETE statement for each table
  for (const table of tables) {
    await client.execute(`DELETE FROM ${table.name};`);
  }
  console.log(`All tables cleaned for ${db.Name} in the group ${db.Group}!`);
}

export default async function wipeGroups({
  groupNames,
}: {
  groupNames: string[];
}) {
  try {
    const spinner = ora(`Starting Wipe`).start();

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

    const tokensPromises = groupNames.map(async (groupName) => {
      spinner.text = `Generating 3 minute token for ${groupName}...`;
      const tokenResponse = await fetch(
        `https://api.turso.tech/v1/organizations/${MIGRATIONS_TURSO_ORG_SLUG}/groups/${groupName}/auth/tokens?expiration=3m`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MIGRATIONS_TURSO_AUTH_TOKEN}`,
          },
        },
      );
      const { jwt: token } = await tokenResponse.json();
      return { groupName, token };
    });

    const databasesWithTokens = await Promise.all(tokensPromises);

    const formattedDatabases: {
      Name: string;
      Group: string;
      secret: string;
    }[] = databases
      .map((db: any) => {
        const group = databasesWithTokens.find(
          (group) => group.groupName === db.group,
        );
        if (!group) {
          return null;
        }
        return {
          Name: db.Name,
          Group: db.group,
          secret: group.token,
        };
      })
      .filter(Boolean); // This will remove null values

    const filteredDatabases = formattedDatabases.filter(
      (db) =>
        databasesWithTokens.some((group) => group.groupName === db.Group) &&
        db.Name.startsWith("t-"),
    );

    if (filteredDatabases.length === 0) {
      spinner.fail(
        "No databases to wipe! Make sure you configured your .env file correctly and that your databases are named correctly. (starting with a t-)",
      );
      process.exit(1);
    }

    spinner.text = "Cleaning tables...";
    await Promise.all(filteredDatabases.map((db) => cleanTables(db)));

    process.exit(0);
  } catch (error) {
    console.error("Error performing wipe: ", error);
    process.exit(1);
  }
}
