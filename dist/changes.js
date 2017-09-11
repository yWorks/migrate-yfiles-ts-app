"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
exports.changes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../changes.json"), "utf-8"));
//# sourceMappingURL=changes.js.map