// Creates a new assistant if one has not already been created
//In the future maybe we can specify the type of assistant in params
//Will have no params. Will return openai assistant.
//Check if assistant already exists (we will pull a json file )
import * as fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

export async function createAssistant() {
  try {
    const path = "./src/ai/assistant.json";
    const assistantData = await fs.promises.readFile(path, "utf8");
    const assistantDetails = JSON.parse(assistantData);
    const assistantId = assistantDetails.assistantId;
    console.log("existing assistant detected");
    return await openai.beta.assistants.retrieve(assistantId);
  } catch (error) {
    console.error(error);
    return null;
  }
}
