const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
var rimraf = require("rimraf");

const truffleConfig = (value) => {
  return `
  module.exports = {
    compilers: {
      solc: {
      version: "${value}",
      },
    },
  };
  
  `;
};

async function createConfiguration(solidityVersion, directory) {
  if (!solidityVersion) {
    throw new Error("No Solidity version specified");
  }
  const config = truffleConfig(solidityVersion);
  fs.writeFileSync(
    path.join(path.resolve(directory), "truffle-config.js"),
    config,{
      flag:"wx"
    }
  );
}

async function installDependencies(directory) {
  execSync(`cd ${directory} && yarn`);
}

async function compile(directory) {
  console.log("excutiing in directory: ", directory);
  execSync(`cd ${directory} && truffle compile`);
}

const renameFile = (filename, inExtension, outExtension) => {
  return filename.split(inExtension)[0] + outExtension;
};

const getFileName = (githubUrl) => {
  const parts = githubUrl.split("/");
  return parts[parts.length - 1];
};

async function getByteCode(githubUrl, directory) {
  const fileName = getFileName(githubUrl);
  const abiFileName = renameFile(fileName, "sol", "json");

  const dir = path.join(directory, "build", "contracts", abiFileName);

  const data = fs.readFileSync(dir).toString();

  const { deployedBytecode, bytecode } = JSON.parse(data);
  return { deployedBytecode, bytecode };
}

module.exports = {
  getByteCode,
  createConfiguration,
  compile,
  installDependencies,
};
