import { convertScrapboxToObsidian, clearDownloadList, getDownloadList } from "./convert.js";
import { parse } from "https://esm.sh/@progfay/scrapbox-parser@8.1.0";
import { ensureDir, existsSync } from "https://deno.land/std@0.170.0/fs/mod.ts";

await ensureDir("./obsidianPages");

const filePath = Deno.args[0];
const projectName = Deno.args[1] ?? "PROJECT_NAME";
const sid = Deno.args[2];
try {
  clearDownloadList();
  const projectFile = await Deno.readTextFile(`./${filePath}`);
  const projectJson = JSON.parse(projectFile);
  const pages = projectJson["pages"];
  for (const page of pages) {
    const blocks = parse(page["lines"].join("\n"));
    const obsidianPage = blocks.map((block) =>
      convertScrapboxToObsidian(block, 0, projectName)
    ).join("\n");
    const obsidianPagePath = `./obsidianPages/${
      page["title"].replace(/\//gi, "-")
    }.md`;
    await Deno.writeTextFile(obsidianPagePath, obsidianPage);
    await Deno.utime(obsidianPagePath, new Date(), page["updated"]);
  }

  // Download images
  const downloadList = getDownloadList();
  if (downloadList.length > 0) {
    // Create a directory for images
    await ensureDir("./obsidianPages/images");
    console.log(`Downloading ${downloadList.length} images`);
  }
  for (let i = 0; i < downloadList.length; i++) {
    const imageUrl = downloadList[i];
    // Download image if not exists
    if (existsSync(`./obsidianPages/images/${imageUrl.replace("https://scrapbox.io/files/", "")}`)) {
      console.log(`Skipping ${i + 1}/${downloadList.length}: ${imageUrl} because it already exists`);
      continue;
    }


    const headers = {}
    if (sid) {
      headers['Cookie'] = `connect.sid=${sid}`
    }
    const response = await fetch(imageUrl, {
      headers: headers
    });
    if (!response.ok) {
      console.error(`Failed to download ${i + 1}/${downloadList.length}: ${imageUrl}: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to download ${imageUrl}: ${response.status} ${response.statusText}`);
    }
    const imageData = new Uint8Array(await response.arrayBuffer());
    const imagePath = `./obsidianPages/images/${imageUrl.replace("https://scrapbox.io/files/", "")}`;
    await Deno.writeFile(imagePath, imageData);

    // Wait for 2 seconds
    const timeInterval = 2;
    console.log(`Downloaded ${i + 1}/${downloadList.length}: ${imageUrl}, and wait ${timeInterval} seconds`);
    await new Promise((resolve) => setTimeout(resolve, timeInterval * 1000));
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error("the file was not found");
  } else {
    throw error;
  }
}
