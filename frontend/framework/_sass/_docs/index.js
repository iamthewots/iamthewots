import fs from "fs";

const data = { variables: {}, classNames: [] };
const variablesRegExp = new RegExp(/--\w+[\w\d]*.*;/, "g");
const classNamesRegExp = new RegExp(/\.\w+.*{/, "g");
const inputFilePath = "./assets/style.css";
const outputFilePath = "./assets/data.json";
let rawFileText = "";

try {
  rawFileText = fs.readFileSync(inputFilePath, "utf8");
} catch (error) {
  console.log(error);
  process.exit();
}

try {
  rawFileText.match(variablesRegExp).forEach((string) => {
    const [key, value] = string.replace(/[\s;]/g, "").split(":");
    data.variables[key] = value;
  });

  rawFileText.match(classNamesRegExp).forEach((string) => {
    data.classNames.push(string.replace(/[\s;{]/g, "").split(","));
  });
} catch (error) {
  console.log(error);
  process.exit();
}

try {
  fs.writeFileSync(outputFilePath, JSON.stringify(data));
} catch (error) {
  console.log(error);
  process.exit();
}
