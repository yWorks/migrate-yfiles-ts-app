import * as fs from "fs"
import * as path from "path";

export const changes = JSON.parse(fs.readFileSync(path.resolve("./changes.json"), "utf-8"));