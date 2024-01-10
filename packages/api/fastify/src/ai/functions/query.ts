/* query.ts: Contains the function the assistant will run when it needs to 
look up anything in the database */

import db from "../../db/client";

type queryInput = { sql: string };

export async function query(params: queryInput) {
  const { sql } = params;

  try {
    console.log("AI SQL: ", sql);
    const rawData = await db.execute(sql);
    const stringData = JSON.stringify(rawData.rows);
    console.log("DB Data: ", stringData);
    return stringData;
  } catch (error) {
    console.error(error);
    return null;
  }
}
