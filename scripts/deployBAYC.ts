import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BAYC = await ethers.getContractFactory("BoredApeYachtClubTest");
  const bayc = await BAYC.deploy();

  await bayc.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("BAYC deployed to:", bayc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
