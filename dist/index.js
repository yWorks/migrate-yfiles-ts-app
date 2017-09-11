#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslint_1 = require("tslint");
var fs = require("fs");
var minimist = require("minimist");
var path = require("path");
var mkdirp = require("mkdirp");
var minimistOptions = {
    string: ["project", "out"],
    boolean: ["fix"],
    alias: {
        o: "out"
    },
    "default": {
        "fix": false,
        "project": "tsconfig.json",
        "out": "./"
    }
};
var cliOptions = minimist(process.argv.slice(2), minimistOptions);
var configurationFilename = "tslint.json";
var options = {
    fix: false,
    formatter: "prose",
    rulesDirectory: "dist/customRules/",
    typeCheck: true,
    project: "test-tsconfig.json"
};
var program = tslint_1.Linter.createProgram(options.project);
var projectBaseDir = path.parse(cliOptions.project).dir;
for (var _i = 0, _a = program.getRootFileNames(); _i < _a.length; _i++) {
    var fileName = _a[_i];
    var linter = new tslint_1.Linter(options, program);
    var fileContents = fs.readFileSync(fileName, "utf8");
    var configuration = tslint_1.Configuration.findConfiguration(configurationFilename, fileName).results;
    linter.lint(fileName, fileContents, configuration);
    var result = linter.getResult();
    if (cliOptions.fix) {
        var allFixes = result.failures.filter(function (failure) { return failure.hasFix(); }).map(function (failure) { return failure.getFix(); });
        var sortedFixes = allFixes.sort(function (a, b) { return b.start - a.start; });
        var fixedContent = sortedFixes.reduce(function (content, fix) { return fix.apply(content); }, fileContents);
        var outPath = path.join(cliOptions.out, path.relative(projectBaseDir, fileName));
        mkdirp.sync(path.dirname(outPath));
        fs.writeFileSync(outPath, fixedContent);
    }
    console.log(result.output);
}
//# sourceMappingURL=index.js.map