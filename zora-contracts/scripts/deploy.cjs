const hre = require("hardhat");

async function main() {
  console.log("Deploying ZoraNFT contract...");

  const ZoraNFT = await hre.ethers.getContractFactory("ZoraNFT");
  const zoraNFT = await ZoraNFT.deploy("Promraw NFT", "PRAW");

  await zoraNFT.waitForDeployment();

  const address = await zoraNFT.getAddress();
  console.log(`ZoraNFT deployed to: ${address}`);
  console.log("Please update your .env.local file with this address:");
  console.log(`NEXT_PUBLIC_ZORA_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 