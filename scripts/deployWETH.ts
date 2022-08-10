import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();

  await weth.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("WETH deployed to:", weth.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
