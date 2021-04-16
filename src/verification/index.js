const { verifyByteCode } = require("./verify");
const chalk = require("chalk");
const ora = require("ora");

const fs = require("fs");
const path = require("path");
const { getSmartContractCode } = require("./rpc");
const { getCommitHash, clone } = require("./github");
const {
  getByteCode,
  createConfiguration,
  installDependencies,
  compile,
} = require("./truffle");
async function codeVerification(
  contractAddress,
  solidityVersion,
  githubURL,
  chain
) {
  const taskId = contractAddress;

  const directory = path.join(__dirname, "../../", taskId);
  try {
    // todo validate address SDK hmy isAddress
    // todo validate if folder already exist

    // console.log("New task", { taskId, directory });
    var spinner = ora(
      "Getting actual bytecode from the blockchain...\n\n"
    ).start();

    // console.log("Getting actual bytecode from the blockchain...");
    const actualBytecode = await getSmartContractCode(chain, contractAddress);

    if (!actualBytecode || actualBytecode === "0x") {
      spinner.stop();
      throw new Error(`No bytecode found for address ${contractAddress}`);
    }
    spinner.succeed("Getting actual bytecode from the blockchain...\n");
    //console.log("Cloning github...");
    // spinner.stop();
    spinner = ora("Cloning github...\n").start();
    await clone(githubURL, taskId);
    spinner.succeed("Cloning github...\n");
    // spinner.stop();
    // console.log("Creating truffle config...");
    spinner = ora("Creating truffle config...\n").start();
    await createConfiguration(solidityVersion, directory);
    spinner.succeed("Creating truffle config...\n");
    // spinner.stop();
    // await truffle.createMigration(directory, githubURL)
    // console.log("Installing contract dependencies...");
    spinner = ora("Installing contract dependencies...\n").start();
    await installDependencies(directory);
    spinner.succeed("Installing contract dependencies...\n");
    // spinner.stop();
    //  console.log("Compiling...");
    spinner = ora("Compiling...\n").start();
    await compile(directory);
    spinner.succeed("Compiling...\n");
    //  spinner.stop();
    // console.log("Getting compiled bytecode");
    spinner = ora("Getting compiled bytecode\n").start();
    const { deployedBytecode, bytecode } = await getByteCode(
      githubURL,
      directory
    );
    spinner.succeed("Getting compiled bytecode\n");
    //console.log("Cleaning up...\n");
    spinner = ora("Cleaning up...\n").start();
    const verified = verifyByteCode(
      actualBytecode,
      deployedBytecode,
      solidityVersion
    );
    spinner.succeed("Cleaning up...\n");
    spinner.stop();
    if (verified) {
      const commitHash = await getCommitHash(directory);

      return {
        verified,
        commitHash,
      };
    }
  } catch (error) {
    spinner.stop();
    return {
      verified: false,
      error,
    };
  }

  fs.rmdirSync(directory, { recursive: true });
  spinner.stop();
  return {
    verified: false,
    error: "No match",
  };
}

module.exports = {
  codeVerification,
};
