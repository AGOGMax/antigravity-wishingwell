const fs = require("fs");
const path = require("path");

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

const processData = (data) => {
  const formattedData = JSON.parse(data);
  const tokens = formattedData.tokens;

  const usdcTokens = tokens
    .filter((token) => token.symbol === "USDC")
    .map((token) => `case "${token.address}":`);
  const usdcString = `${usdcTokens[0]}${usdcTokens[1]}{price = 1; break;}`;
  const meme1Tokens = tokens
    .filter((token) => token.symbol === "MEME1" || token.symbol === "MEME3")
    .map((token) => `case "${token.address}":`);
  const meme1String = `${meme1Tokens[0]}${meme1Tokens[1]}{price = 0.0195; break;}`;
  const meme2Tokens = tokens
    .filter((token) => token.symbol === "MEME2" || token.symbol === "MEME4")
    .map((token) => `case "${token.address}":`);
  const meme2String = `${meme2Tokens[0]}${meme2Tokens[1]}{price = 0.000000000029; break;}`;
  const wethTokens = tokens
    .filter((token) => token.symbol === "WETH")
    .map((token) => `case "${token.address}":`);
  const wethString = `${wethTokens[0]}${wethTokens[1]}{price = 2.3; break;}}`;

  console.log({ usdcTokens });

  return `function main() {\n// copy below line \nswitch(token) {${usdcString}${meme1String}${meme2String}${wethString}\n}`;
};

const main = async (inputFilePath, outputFilePath) => {
  try {
    const inputData = await readFile(inputFilePath);
    const formattedData = processData(inputData);
    await writeFile(outputFilePath, formattedData);
    console.log(`Data has been formatted and written to ${outputFilePath}`);
  } catch (err) {
    console.error({ err });
  }
};

const inputFilePath = path.join(__dirname, "input_coins.json");
const outputFilePath = path.join(__dirname, "output.js");

main(inputFilePath, outputFilePath);
