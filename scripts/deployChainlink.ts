import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainlinkPriceFeed = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA";
  const ChainlinkConsumer = await ethers.getContractFactory("TestChainlinkConsumer");
  const chainlinkConsumer = await ChainlinkConsumer.deploy(chainlinkPriceFeed);

  await chainlinkConsumer.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Chainlink Consumer deployed to:", chainlinkConsumer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
