import * as fs from "fs"
import * as path from "path";

export const changes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../changes.json"), "utf-8"));
