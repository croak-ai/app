/* vectorQuery.ts: Contains the function the assistant will run when it needs to 
look up vectorized data in the database */

import db from "../../db/client";

type queryInput = { sql: string; embedding: string };

export async function vectorQuery(params: queryInput) {
  const { sql, embedding } = params;

  try {
    console.log("AI SQL: ", sql);
    console.log("AI Embedding: ", embedding);
    const readySQL = sql.replace("?", embedding);
    console.log("AI readySQL: ", readySQL);
    const rawData = await db.execute(readySQL);
    const stringData = JSON.stringify(rawData.rows);
    console.log("DB Data: ", stringData);
    return stringData;
  } catch (error) {
    console.error(error);
    return null;
  }
}
