#! /usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import { ncp } from "ncp";

const copy = (source: string, destination: string) =>
  new Promise<void>((res, rej) =>
    ncp(source, destination, (err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    })
  );

const TEMPLATE_DIR = "../templates";

const CHOICES = fs.readdirSync(`${__dirname}/${TEMPLATE_DIR}`);

const QUESTIONS = [
  {
    name: "api-to-generate",
    type: "checkbox",
    message:
      "What API would do you like to use in your project (Select only one) ?",
    choices: CHOICES,
  },
  {
    name: "project-name",
    type: "input",
    message: "Your project name ?",
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
];

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then(async (answers) => {
  const apiChoice = answers["api-to-generate"];
  const projectName = answers["project-name"];
  const templatePath = `${__dirname}/${TEMPLATE_DIR}/${apiChoice}`;

  const rootDest = `${CURR_DIR}/${projectName}`;

  fs.mkdirSync(rootDest);

  await copy(templatePath, projectName);
});
