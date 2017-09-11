#!/usr/bin/env node

import {Linter, Configuration, Replacement} from "tslint";
import * as fs from "fs";
import * as minimist from "minimist";
import * as path from "path";
import * as mkdirp from "mkdirp";

const minimistOptions = {
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

const cliOptions = minimist(process.argv.slice(2), minimistOptions);

const configurationFilename = "tslint.json";
const options = {
  fix: false,
  formatter: "prose",
  rulesDirectory: "dist/customRules/",
  typeCheck: true,
  project: "test-tsconfig.json"
};

const program = Linter.createProgram(options.project);

const projectBaseDir = path.parse(cliOptions.project).dir;

for (let fileName of program.getRootFileNames()) {
  const linter = new Linter(options, program);
  const fileContents = fs.readFileSync(fileName, "utf8");
  const configuration = Configuration.findConfiguration(configurationFilename, fileName).results;

  linter.lint(fileName, fileContents, configuration);
  const result = linter.getResult();

  if (cliOptions.fix) {
    const allFixes = result.failures.filter(failure => failure.hasFix()).map(failure => failure.getFix());
    const sortedFixes = allFixes.sort((a: Replacement, b: Replacement) => b.start - a.start) as Replacement[];

    const fixedContent = sortedFixes.reduce((content, fix) => fix.apply(content), fileContents);

    const outPath = path.join(cliOptions.out, path.relative(projectBaseDir, fileName));

    mkdirp.sync(path.dirname(outPath));

    fs.writeFileSync(outPath, fixedContent);
  }

  console.log(result.output);
}
