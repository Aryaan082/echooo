import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const TokenTransfer = await ethers.getContractFactory("TokenTransfer");
  const tokenTransfer = await TokenTransfer.deploy();

  await tokenTransfer.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Token Transfer deployed to:", tokenTransfer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
