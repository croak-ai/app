// Creates a new assistant if one has not already been created
//In the future maybe we can specify the type of assistant in params
//Will have no params. Will return openai assistant.
//Check if assistant already exists (we will pull a json file )
import * as fs from "fs";
import OpenAI from "openai";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants";
const openai = new OpenAI();
const assistantPath = "./src/ai/assistant.json";

export async function createOrRetrieveAssistant() {
  try {
    const assistantData = await fs.promises.readFile(assistantPath, "utf8");
    const assistantDetails = JSON.parse(assistantData);
    const assistantId = assistantDetails.assistantId;
    console.log("existing assistant detected");

    return await openai.beta.assistants.retrieve(assistantId);
  } catch (error) {
    console.error(error);
    console.log("Assistant does not exist. Creating fresh assistant");

    //In the future we can pull this config from a database.
    const assistantConfig: AssistantCreateParams = {
      name: "Country helper",
      instructions:
        "You're a travelling assistant, helping with information about destination countries.",
      model: "gpt-4-1106-preview",
      tools: [
        {
          type: "function",
          function: {
            name: "getCountryInformation",
            parameters: {
              type: "object",
              properties: {
                country: {
                  type: "string",
                  description: "Country name, e.g. Sweden",
                },
              },
              required: ["country"],
            },
            description: "Determine information about a country",
          },
        },
      ],
    };

    const assistant = await openai.beta.assistants.create(assistantConfig);
    const assistantObj = { assistantId: assistant.id, ...assistantConfig };
    await fs.promises.writeFile(assistantPath, JSON.stringify(assistantObj));
    return assistant;
  }
}
