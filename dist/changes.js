"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
exports.changes = JSON.parse(fs.readFileSync(path.resolve("./changes.json"), "utf-8"));
//# sourceMappingURL=changes.js.map