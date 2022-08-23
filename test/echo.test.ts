import * as dotenv from "dotenv";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Echo } from "../typechain";
import EchoJSON from "../artifacts/contracts/Echo.sol/Echo.json";
import { Contract, Wallet } from "ethers";
import EthCrypto from "eth-crypto";
import { createClient } from "urql";
import "isomorphic-unfetch"; // required for urql: https://github.com/FormidableLabs/urql/issues/283

dotenv.config();
const GRAPH_API_URL = "https://api.thegraph.com/subgraphs/name/mtwichan/echo";

const graphClient = createClient({
  url: GRAPH_API_URL,
});

describe("Echo Contract", () => {
  let wallet: Wallet;
  let contractEcho: Contract;
  let message: string;
  let byteMessage: Uint8Array;
  let originalMessage: string;

  beforeEach(async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://api.avax-test.network/ext/bc/C/rpc`
    );
    const privateKey = process.env.PRIVATE_KEY_MATIC || "";
    wallet = new ethers.Wallet(privateKey, provider);
    const contractAddress = "0x81B9DE4383571a209cB4290D98716e8Cf4eF86Fe";
    contractEcho = await new ethers.Contract(
      contractAddress,
      EchoJSON.abi,
      provider
    );
  });


  it("Can send and receive a message with JSON metadata", async () => {
    const ethWallet2 = EthCrypto.createIdentity();
    const message = "wassup Aryaan";
    const messageMetadata = {
        message: message,
        metadata: {
          tokenAmount: ethers.utils.parseEther("1"),
          tokenId: 1,
          timeExpiry: 10012301230,
          buyer: "0xasda",
          seller: "0xasda",
          tokenAddress: "0xasda",
          NFTAddress: "0xasda"
        }
    };

    const messageJSON = JSON.stringify(messageMetadata);

    console.log("message json >>> ", messageJSON);

    const messageEncryptedSender = await EthCrypto.encryptWithPublicKey(
      ethWallet2.publicKey,
      message
  );

    const messageEncryptedReceiver = await EthCrypto.encryptWithPublicKey(
        ethWallet2.publicKey,
        messageJSON
    );

    const messageEncryptedStringSender = await EthCrypto.cipher.stringify(
      messageEncryptedSender
  );

    const messageEncryptedStringReceiver = await EthCrypto.cipher.stringify(
      messageEncryptedReceiver
  );

    const tx = await contractEcho.connect(wallet).logMessage(1, "0xD9Fd4b2ea4D5C47B5AD15a8A71A38fC0511A03Fc", messageEncryptedStringSender, messageEncryptedStringReceiver);
    const txReceipt = await tx.wait();
    
    const decryptedMessageReceiver = await EthCrypto.decryptWithPrivateKey(
        ethWallet2.privateKey,
        EthCrypto.cipher.parse(messageEncryptedStringReceiver)
    );
    
    const dejsonifiedMessageReceiver = JSON.parse(decryptedMessageReceiver);
    console.log("decrypted message >>> ", decryptedMessageReceiver);
    console.log("json parse decrypted message >>> ", dejsonifiedMessageReceiver);
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
