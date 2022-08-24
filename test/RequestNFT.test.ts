import * as dotenv from "dotenv";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RequestNFT, TestERC20Token, TestERC721Token } from "../typechain";

import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

dotenv.config();

// TODO: Add tests for edge cases
describe("SendCrypto Contract", () => {
  let deployer: SignerWithAddress;
  let bob: SignerWithAddress;
  let requestNFTContract: RequestNFT;
  let testERC20TokenContract: TestERC20Token;
  let testERC721TokenContract: TestERC721Token;

  beforeEach(async () => {
    [deployer, bob] = await ethers.getSigners();
    const RequestNFT = await ethers.getContractFactory("RequestNFT");
    requestNFTContract = (await RequestNFT.deploy()) as RequestNFT;
    await requestNFTContract.deployed();

    const TestERC20Token = await ethers.getContractFactory("TestERC20Token");
    testERC20TokenContract = (await TestERC20Token.deploy(
      ethers.utils.parseEther("1000")
    )) as TestERC20Token;
    await testERC20TokenContract.deployed();

    const TestERC721Token = await ethers.getContractFactory("TestERC721Token");
    testERC721TokenContract =
      (await TestERC721Token.deploy()) as TestERC721Token;
    testERC721TokenContract.safeMint(bob.address);
    await testERC721TokenContract.deployed();
  });

  it("Can exchange", async () => {
    await testERC20TokenContract
      .connect(deployer)
      .approve(requestNFTContract.address, ethers.utils.parseEther("100"));
    expect(
      await testERC20TokenContract
        .connect(deployer)
        .allowance(deployer.address, requestNFTContract.address)
    ).to.be.equal(ethers.utils.parseEther("100"));
    expect(
      await testERC721TokenContract.connect(bob).balanceOf(bob.address)
    ).to.be.equal(1);
    expect(await testERC721TokenContract.connect(bob).ownerOf(1)).to.be.equal(
      bob.address
    );
    const types = {
      Buy: [
        { name: "tokenAmount", type: "uint256" },
        { name: "tokenId", type: "uint256" },
        { name: "timeExpiry", type: "uint256" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "tokenAddress", type: "address" },
        { name: "NFTAddress", type: "address" },
      ],
    };

    const domainData = {
      name: "RequestNFT",
      chainId: await bob.getChainId(),
      verifyingContract: requestNFTContract.address,
      // salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558",
    };

    const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;

    const data = {
      tokenAmount: ethers.utils.parseEther("50"),
      tokenId: 1,
      timeExpiry: timeStamp + 1000 * 1000,
      buyer: deployer.address,
      seller: bob.address,
      tokenAddress: testERC20TokenContract.address,
      NFTAddress: testERC721TokenContract.address,
    };

    let digest = await deployer._signTypedData(domainData, types, data);

    let { v, r, s } = await ethers.utils.splitSignature(digest);

    await testERC721TokenContract
      .connect(bob)
      .approve(requestNFTContract.address, 1);
    await requestNFTContract.connect(bob).exchange(data, v, r, s);

    expect(
      await testERC20TokenContract.connect(bob).balanceOf(bob.address)
    ).to.be.equal(ethers.utils.parseEther("50"));
    expect(
      await testERC20TokenContract.connect(deployer).balanceOf(deployer.address)
    ).to.be.equal(ethers.utils.parseEther("950"));
    expect(
      await testERC721TokenContract.connect(deployer).ownerOf(1)
    ).to.be.equal(deployer.address);
  });

  it("Cannot exchange after time expiry", async () => {
    await testERC20TokenContract
      .connect(deployer)
      .approve(requestNFTContract.address, ethers.utils.parseEther("100"));
    expect(
      await testERC20TokenContract
        .connect(deployer)
        .allowance(deployer.address, requestNFTContract.address)
    ).to.be.equal(ethers.utils.parseEther("100"));
    expect(
      await testERC721TokenContract.connect(bob).balanceOf(bob.address)
    ).to.be.equal(1);
    expect(await testERC721TokenContract.connect(bob).ownerOf(1)).to.be.equal(
      bob.address
    );
    const types = {
      Buy: [
        { name: "tokenAmount", type: "uint256" },
        { name: "tokenId", type: "uint256" },
        { name: "timeExpiry", type: "uint256" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "tokenAddress", type: "address" },
        { name: "NFTAddress", type: "address" },
      ],
    };

    const domainData = {
      name: "RequestNFT",
      chainId: await bob.getChainId(),
      verifyingContract: requestNFTContract.address,
      // salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558",
    };

    const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;

    const data = {
      tokenAmount: ethers.utils.parseEther("50"),
      tokenId: 1,
      timeExpiry: timeStamp,
      buyer: deployer.address,
      seller: bob.address,
      tokenAddress: testERC20TokenContract.address,
      NFTAddress: testERC721TokenContract.address,
    };

    await ethers.provider.send("evm_mine", [timeStamp + 1000]);
    let digest = await deployer._signTypedData(domainData, types, data);

    let { v, r, s } = await ethers.utils.splitSignature(digest);

    await testERC721TokenContract
      .connect(bob)
      .approve(requestNFTContract.address, 1);
    expect(
      requestNFTContract.connect(bob).exchange(data, v, r, s)
    ).to.be.revertedWith("RequestNFT:exchange: offer has expired");
  });
});
