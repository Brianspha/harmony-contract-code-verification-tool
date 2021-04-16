const { codeVerification } = require("../verification/index");
const ora = require("ora");

async function verifyContract(contractDets) {
  const spinner = ora("Verifying Contract ByteCode....\n").start();
  codeVerification(
    contractDets.contractAddress || contractDets.Ca,
    contractDets.solcVersion || contractDets.Sv,
    contractDets.repoUrl || contractDets.Ru,
    contractDets.chain || contractDets.c
  ).then((res) => {
    console.table(res);
    spinner.succeed("Completed Verification with results");
    spinner.stop();
    process.exit(0);
  });
}

module.exports = {
  verifyContract,
};
