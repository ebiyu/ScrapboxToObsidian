# ScrapboxToObsidian
Convert scrapbox json file to a folder of markdown files for Obsidian.
## Usage
`deno run --allow-run --allow-read --allow-write --allow-net mod.ts SCRAPBOX_EXPORTED_FILE.json PROJECT_NAME`
- The project `PROJECT_NAME` will be used as the source of icons.
- If you want to download images, you can use the following command.
    - `deno run --allow-run --allow-read --allow-write --allow-net mod.ts SCRAPBOX_EXPORTED_FILE.json PROJECT_NAME SID`
    - `SID` is the session id of scrapbox.
