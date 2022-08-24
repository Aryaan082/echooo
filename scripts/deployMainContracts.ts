import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const Echo = await ethers.getContractFactory("Echo");
  const echo = await Echo.deploy();
  await echo.deployed();

  const TokenTransfer = await ethers.getContractFactory("TokenTransfer");
  const tokenTransfer = await TokenTransfer.deploy();
  await tokenTransfer.deployed();

  const PFP = await ethers.getContractFactory("ProfilePicture");
  const pfp = await PFP.deploy();
  await pfp.deployed();

  const RequestNFT = await ethers.getContractFactory("RequestNFT");
  const requestNFT = await RequestNFT.deploy();
  await requestNFT.deployed();

  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`contractEcho: "${echo.address}",`);
  console.log(`contractTokenTransfer: "${tokenTransfer.address}",`);
  console.log(`contractPFP: "${pfp.address}",`);
  console.log(`contractRequestNFT: "${requestNFT.address}",`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
