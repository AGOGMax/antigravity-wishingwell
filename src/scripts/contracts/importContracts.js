const fs = require("fs");
const path = require("path");
const { CONFIG_TEMPLATE } = require("./template");

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const processData = async (data) => {
  const formattedData = data
    .split("\n")
    .map((text) => text.charAt(0).toLowerCase() + text.slice(1));
  const filteredList = formattedData.filter((data) => data !== "");
  const contracts = [];

  const possibleChains = [
    "sepolia",
    "baseSepolia",
    "base",
    "pulsechain",
    "pulsechainTestnet",
  ];

  let currentChain = "";
  let currentObject = {};
  let final = "";

  filteredList.forEach(async (data) => {
    if (possibleChains.includes(data)) {
      currentChain = data;
      if (currentChain === "baseSepolia") {
        console.log("Setting template", currentObject);
        const template = `${CONFIG_TEMPLATE}`;
        const template_parts = template.split("#here");
        const template_final = `${template_parts[0]}${JSON.stringify(currentObject)}${template_parts[1]}`;
        final = template_final;
      }
      if (currentObject) {
        contracts.push(currentObject);
      }
      currentObject = {};
    } else {
      const parts = data.split(": ");
      if (parts[0] !== "antigravity") {
        currentObject[parts[0]] = parts[1];
      }
    }
  });
  return final;
};

const main = async (inputFilePath, outputFilePath) => {
  try {
    const inputData = await readFile(inputFilePath);
    const formattedData = await processData(inputData);
    console.log({ formattedData });
    await writeFile(outputFilePath, formattedData);
    console.log(`Data has been formatted and written to ${outputFilePath}`);
  } catch (err) {
    console.error({ err });
  }
};

const inputFilePath = path.join(__dirname, "input_contracts.txt");
const outputFilePath = path.join(__dirname, "config.txt");

main(inputFilePath, outputFilePath);
