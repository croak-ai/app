import * as fs from "fs";
import * as path from "path";

(async () => {
  const directoryPath = path.join(__dirname, "./migrations");
  const outputFile = path.join(__dirname, "./migrations/assistant-context.txt");

  try {
    const files = await fs.promises.readdir(directoryPath);
    const sqlFiles = files.filter(file => file.endsWith(".sql"));
    let combinedQueries = "";

    for (const file of sqlFiles) {
      const filePath = path.join(directoryPath, file);
      const content = await fs.promises.readFile(filePath, "utf8");
      const cleanedContent = content.replace(/`/g, '"').replace(/--> statement-breakpoint/g, "");
      combinedQueries += cleanedContent + "\n\n"; // Ensure a new line is added when opening a new file
    }

    await fs.promises.writeFile(outputFile, combinedQueries.trim()); // Trim to remove the last new line added unnecessarily
    console.log("Assistant context generated successfully.");
  } catch (err) {
    console.error("Error processing directory:", err);
  }
})();
