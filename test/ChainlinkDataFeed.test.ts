import * as dotenv from "dotenv";
import { expect } from "chai";
import { ethers } from "hardhat";
import {  } from "../typechain";
import TestChainlinkConsumerJSON from "../artifacts/contracts/TestChainlinkConsumer.sol/TestChainlinkConsumer.json";
import { Contract, Wallet } from "ethers";

dotenv.config();
describe("Echo Contract", () => {
  let wallet: Wallet;
  let contractChainlinkConsumer: Contract;

  beforeEach(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://api.avax-test.network/ext/bc/C/rpc`
    );
    const privateKey = process.env.PRIVATE_KEY_MATIC || "";
    wallet = new ethers.Wallet(privateKey, provider);
    const contractAddress = "0x8a19C3b0e4b64393c32A16f0ED07852192d87F40";
    contractChainlinkConsumer = await new ethers.Contract(
      contractAddress,
      TestChainlinkConsumerJSON.abi,
      provider
    );
  });

  it.only("Can retrieve recent price feed data", async () => {
    console.log(await contractChainlinkConsumer.getLatestPrice());
  });

  // it("Can log a message", async () => {
  //   const tx = await contractEcho
  //     .connect(wallet)
  //     .logMessage("0xcd3b766ccdd6ae721141f452c550ca635964ce71", "hello world");
  //   const txReceipt = await tx.wait();
  //   console.log(txReceipt);
  //   console.log(txReceipt.events);
  // });

  // it("Can log a identity", async () => {
  //   const tx = await contractEcho
  //     .connect(wallet)
  //     .logIdentity("0xcd3b766ccdd6ae721141f452c550ca635964ce71");
  //   const txReceipt = await tx.wait();
  //   console.log(txReceipt);
  //   console.log(txReceipt.events);
  // });

  // it("Can encrypt and decrypt message", async () => {
  //   const ethWallet2 = EthCrypto.createIdentity();

  //   let tx = await contractEcho.connect(wallet).logIdentity(ethWallet2.address);
  //   let txReceipt = await tx.wait();

  //   message = "We're going to win everything!!";
  //   const messageEncrypted = await EthCrypto.encryptWithPublicKey(
  //     ethWallet2.publicKey,
  //     message
  //   );

  //   console.log("message", message);
  //   const messageEncryptedString = await EthCrypto.cipher.stringify(
  //     messageEncrypted
  //   );
  //   console.log("message encrypted", messageEncryptedString);
  //   tx = await contractEcho
  //     .connect(wallet)
  //     .logMessage(ethWallet2.address, messageEncryptedString);
  //   txReceipt = await tx.wait();

  //   console.log(txReceipt.events![0].args!.message);
  //   expect(
  //     await EthCrypto.decryptWithPrivateKey(
  //       ethWallet2.privateKey,
  //       EthCrypto.cipher.parse(txReceipt.events![0].args!.message)
  //     )
  //   ).equals(message);
  // });

  // it("Test utf8byte decryption", async () => {
  //   message = "Hi im person one";

  //   byteMessage = ethers.utils.toUtf8Bytes(message);

  //   originalMessage = ethers.utils.toUtf8String(byteMessage);

  //   expect(message).equals(originalMessage);
  // });

  // it("Test encrypting then decrypting messages", async () => {
  //   const ethWallet2 = EthCrypto.createIdentity();

  //   message = "world hello!!";
  //   const messageEncrypted = await EthCrypto.encryptWithPublicKey(
  //     ethWallet2.publicKey,
  //     message
  //   );
  //   console.log("message", message);
  //   const messageEncryptedString = await EthCrypto.cipher.stringify(
  //     messageEncrypted
  //   );
  //   console.log("message encrypted", messageEncryptedString);

  //   expect(
  //     await EthCrypto.decryptWithPrivateKey(
  //       ethWallet2.privateKey,
  //       EthCrypto.cipher.parse(messageEncryptedString)
  //     )
  //   ).equals(message);
  // });

  // it("Can create communication address", async () => {
  //   const ethWallet = EthCrypto.createIdentity(); // create a pair of communication addresses
  //   console.log("public key >>>", ethWallet.publicKey);
  //   console.log("private key >>>", ethWallet.privateKey);
  //   const publicKey = ethWallet.publicKey;
  //   const tx = await contractEcho.connect(wallet).logIdentity(publicKey);
  //   await tx.wait();
  //   // expect(await contractEcho.connect(wallet).logIdentity(ethWallet.publicKey)).to.emit(contractEcho, "IdentityEvent").withArgs(ethWallet.publicKey);
  // });

  // it("Can send messages", async () => {
  //   const message = "this is a very very secret message ...";
  //   const BIdentity = wallet.address;
  //   const identitiesQuery = `
  //     query {
  //       identities(where: {from: "${BIdentity}"}, first: 1, orderBy: timestamp, orderDirection: desc) {
  //         communicationAddress,
  //         timestamp
  //       }
  //     }
  //   `;
  //   const data = await graphClient.query(identitiesQuery).toPromise();
  //   const communicationAddress = data.data.identities[0].communicationAddress;
  //   console.log("communication address >>>", communicationAddress);
  //   const messageEncrypted = await EthCrypto.encryptWithPublicKey(
  //     communicationAddress,
  //     message
  //   );
  //   const messageEncryptedString = await EthCrypto.cipher.stringify(
  //     messageEncrypted
  //   );
  //   console.log("message encrypted >>>", messageEncryptedString);
  //   await contractEcho
  //     .connect(wallet)
  //     .logMessage(BIdentity, messageEncryptedString);
  // });

  // it("Can receive messages", async () => {
  //   const BPublicCommuncationAddress = wallet.address;
  //   const BPrivateCommunicationAddress =
  //     "0x87444924e8cc0783e721c55d13eaf51abf31b5aeda971ffdf05c7b3ae8e646fa";
  //   const identitiesTimestampQuery = `
  //     query {
  //       identities(
  //         where: {
  //           from: "${BPublicCommuncationAddress}"
  //         }
  //         first: 1
  //         orderBy: timestamp
  //         orderDirection: desc
  //       ) {
  //         communicationAddress
  //         timestamp
  //       }
  //     }
  //   `;
  //   const dataIdentity = await graphClient
  //     .query(identitiesTimestampQuery)
  //     .toPromise();
  //   const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;
  //   const dataIdentityCommAddress =
  //     dataIdentity.data.identities[0].communicationAddress; // TODO: Use this to check that this address matches our comm address

  //   const messagesQuery = `
  //     query {
  //       messages(where: {timestamp_gte: "${dataIdentityTimestamp}"}, orderBy: timestamp, orderDirection: desc) {
  //         message,
  //         timestamp
  //       }
  //     }
  //   `;
  //   const dataMessages = await graphClient.query(messagesQuery).toPromise();
  //   const dataMessagesParsed = dataMessages.data.messages;
  //   console.log("messages >>>", dataMessagesParsed);
  //   for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
  //     const message = dataMessagesParsed[idx].message;
  //     const decryptedMessage = await EthCrypto.decryptWithPrivateKey(
  //       BPrivateCommunicationAddress,
  //       EthCrypto.cipher.parse(message)
  //     );
  //     console.log(`Decrypted message ${idx} >>>`, decryptedMessage);
  //   }
  // });
});
