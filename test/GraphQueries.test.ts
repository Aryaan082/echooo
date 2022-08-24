// import * as dotenv from "dotenv";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { Echo } from "../typechain";
// import EchoJSON from "../artifacts/contracts/Echo.sol/Echo.json";
// import { Contract, Wallet } from "ethers";
// import EthCrypto from "eth-crypto";
// import { createClient } from "urql";
// import "isomorphic-unfetch"; // required for urql: https://github.com/FormidableLabs/urql/issues/283

// dotenv.config();
// const GRAPH_API_URL = "https://api.thegraph.com/subgraphs/name/mtwichan/echo";

// const graphClient = createClient({
//   url: GRAPH_API_URL,
// });

// describe.only("The Graph Queries", () => {
//   let walletOne: Wallet;
//   let walletTwo: Wallet;
//   let contractEcho: Contract;
//   let message: string;
//   let byteMessage: Uint8Array;
//   let originalMessage: string;

//   beforeEach(async () => {
//     const provider = new ethers.providers.JsonRpcProvider(
//       `https://rpc.ankr.com/avalanche_fuji`
//     );
//     const privateKeyOne = process.env.PRIVATE_KEY_MATIC || "";
//     const privateKeyTwo = process.env.PRIVATE_KEY_MATIC_TWO || "";
//     walletOne = new ethers.Wallet(privateKeyOne, provider);
//     walletTwo = new ethers.Wallet(privateKeyTwo, provider);
//     const contractAddress = "0x916AbE4ee97D6288eE7A8F24857C7e20a4dfe621";
//     contractEcho = await new ethers.Contract(
//       contractAddress,
//       EchoJSON.abi,
//       provider
//     );
//   });

//   it("Can get unknown addresses relative to a trusted list of addresses", async () => {});
// });
