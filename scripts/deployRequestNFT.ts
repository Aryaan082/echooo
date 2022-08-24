import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const RequestNFT = await ethers.getContractFactory("RequestNFT");
  const requestNFT = await RequestNFT.deploy();

  await requestNFT.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("RequestNFT deployed to:", requestNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
