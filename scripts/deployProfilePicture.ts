import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const ProfilePicture = await ethers.getContractFactory("ProfilePicture");
  const profilePicture = await ProfilePicture.deploy();

  await profilePicture.deployed();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Profile Picture deployed to:", profilePicture.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
