// import * as dotenv from "dotenv";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { TokenTransfer, TestERC20Token } from "../typechain";
// import ERC20JSON from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";
// import { Contract } from "ethers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// dotenv.config();

// // TODO: Add tests for edge cases
// describe("SendCrypto Contract", () => {
//   //   let contractSendCrypto: Contract;
//   let deployer: SignerWithAddress;
//   let alice: SignerWithAddress;
//   let bob: SignerWithAddress;
//   let sendCryptoContract: TokenTransfer;
//   let testERC20TokenContract: TestERC20Token;
//   let testERC20TokenInstance: Contract;

//   beforeEach(async () => {
//     [deployer, alice, bob] = await ethers.getSigners();
//     const SendCrypto = await ethers.getContractFactory("SendCrypto");
//     sendCryptoContract = (await SendCrypto.deploy()) as TokenTransfer;
//     await sendCryptoContract.deployed();

//     const TestERC20Token = await ethers.getContractFactory("TestERC20Token");
//     testERC20TokenContract = (await TestERC20Token.deploy(ethers.utils.parseEther("1000"))) as TestERC20Token;
//     await testERC20TokenContract.deployed();

//     testERC20TokenInstance = await new ethers.Contract(
//       testERC20TokenContract.address,
//       ERC20JSON.abi,
//       deployer
//     );

//   });

//   it("Can transfer ERC20 tokens to another user", async () => {
//     await testERC20TokenInstance.connect(deployer).approve(sendCryptoContract.address, ethers.utils.parseEther("100"));
//     expect(await testERC20TokenContract.connect(deployer).allowance(deployer.address, sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("100"));
//     await sendCryptoContract.connect(deployer).sendERC20Token(testERC20TokenContract.address, alice.address, ethers.utils.parseEther("100"));
//     expect(await testERC20TokenContract.connect(alice).balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("99")); // take 1% tax
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(deployer.address)).to.be.equal(ethers.utils.parseEther("900"));
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("1"));
//   });

//   it("Can transfer ERC20 tokens to multiple users", async () => {
//     await testERC20TokenInstance.connect(deployer).approve(sendCryptoContract.address, ethers.utils.parseEther("200"));
//     expect(await testERC20TokenContract.connect(deployer).allowance(deployer.address, sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("200"));
//     await sendCryptoContract.connect(deployer).sendERC20TokenGroup(testERC20TokenContract.address, [alice.address, bob.address], [ethers.utils.parseEther("100"), ethers.utils.parseEther("100")], ethers.utils.parseEther("200"));
//     expect(await testERC20TokenContract.connect(alice).balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("99")); // take 1% tax
//     expect(await testERC20TokenContract.connect(alice).balanceOf(bob.address)).to.be.equal(ethers.utils.parseEther("99")); // take 1% tax
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(deployer.address)).to.be.equal(ethers.utils.parseEther("800"));
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("2"));
//   });

//   it("Can transfer ether to another user", async () => {
//     const provider = ethers.provider;
//     console.log(await provider.getBalance(sendCryptoContract.address))
//     const aliceBalance = await alice.getBalance();
//     await sendCryptoContract.connect(deployer).sendEther(alice.address, { value: ethers.utils.parseEther("100") });
//     expect((await alice.getBalance()).gt(aliceBalance)).to.be.equal(true);
//     expect(await provider.getBalance(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("1")); // 1% tax
//   });

//   it("Can transfer ether to multiple users", async () => {
//     const provider = ethers.provider;
//     const aliceBalance = await alice.getBalance();
//     const bobBalance = await bob.getBalance();

//     await sendCryptoContract.connect(deployer).sendEtherGroup([alice.address, bob.address], [ethers.utils.parseEther("100"), ethers.utils.parseEther("100")], { value: ethers.utils.parseEther("200") });
//     expect((await alice.getBalance()).gt(aliceBalance)).to.be.equal(true);
//     expect((await alice.getBalance()).gt(bobBalance)).to.be.equal(true);
//     expect(await provider.getBalance(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("2")); // 1% tax
//   });

//   it("Can allow the owner to collect ether taxes", async () => {
//     const provider = ethers.provider;
//     await sendCryptoContract.connect(deployer).sendEther(alice.address, { value: ethers.utils.parseEther("100") });
//     await sendCryptoContract.connect(deployer).sendEtherGroup([alice.address, bob.address], [ethers.utils.parseEther("100"), ethers.utils.parseEther("100")], { value: ethers.utils.parseEther("200") });
//     expect(await provider.getBalance(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("3")); // 1% tax
//     const ownerBalance = await deployer.getBalance();
//     const tx = await sendCryptoContract.connect(deployer).collectTaxEther();
//     await tx.wait();
//     expect(await provider.getBalance(sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("0"));
//     expect((await deployer.getBalance()).gt(ownerBalance)).to.be.equal(true);
//   });

//   it("Can allow the owner to collect taxes ERC20 tokens", async () => {
//     await testERC20TokenInstance.connect(deployer).approve(sendCryptoContract.address, ethers.utils.parseEther("200"));
//     expect(await testERC20TokenContract.connect(deployer).allowance(deployer.address, sendCryptoContract.address)).to.be.equal(ethers.utils.parseEther("200"));
//     await sendCryptoContract.connect(deployer).sendERC20TokenGroup(testERC20TokenContract.address,
//       [alice.address, bob.address],
//       [ethers.utils.parseEther("100"), ethers.utils.parseEther("100")],
//       ethers.utils.parseEther("200")
//     );

//     expect(await testERC20TokenContract.connect(alice).balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("99")); // take 1% tax
//     expect(await testERC20TokenContract.connect(bob).balanceOf(bob.address)).to.be.equal(ethers.utils.parseEther("99")); // take 1% tax
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(deployer.address)).to.be.equal(ethers.utils.parseEther("800"));
//     await sendCryptoContract.connect(deployer).collectTaxERC20Tokens(testERC20TokenContract.address);
//     expect(await testERC20TokenContract.connect(deployer).balanceOf(deployer.address)).to.be.equal(ethers.utils.parseEther("802"));
//   });
// });
