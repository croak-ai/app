/* query.ts: Contains the function the assistant will run when it needs to 
look up anything in the database */

import db from "../../db/client";

type queryInput = { query: string };

export async function runDatabaseQuery(params: queryInput) {
  const { query } = params;

  try {
    console.log("AI SQL: ", query);
    if (!query) {
      return "SQL malformed or missing. Please try again.";
    }
    const rawData = await db.execute(query);

    if (rawData.rows.length === 0) {
      return "No results found";
    }
    const stringData = JSON.stringify(rawData.rows);
    console.log("DB Data: ", stringData);
    return stringData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
