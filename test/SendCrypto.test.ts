import * as dotenv from "dotenv";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SendCrypto, TestERC20Token} from "../typechain";
import SendCryptoJSON from "../artifacts/contracts/SendCrypto.sol/SendCrypto.json";
import TestERC20TokenJSON from "../artifacts/contracts/TestERC20Token.sol/TestERC20Token.json";
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
//   let contractSendCrypto: Contract;  
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let sendCryptoContract: SendCrypto;
  let testERC20TokenContract: TestERC20Token;
  let testERC20TokenInstance: Contract;
  
  beforeEach(async () => {
    // const provider = new ethers.providers.JsonRpcProvider(
    //   `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    // );
    // const privateKey = process.env.PRIVATE_KEY_MATIC || "";
    // wallet = new ethers.Wallet(privateKey, provider);
    // const contractAddress = "0x21e29E3038AeCC76173103A5cb9711Ced1D23C01";
    // contractSendCrypto = await new ethers.Contract(
    //   contractAddress,
    //   SendCryptoJSON.abi,
    //   provider
    // );
    [deployer, alice, bob] = await ethers.getSigners();
    const SendCrypto = await ethers.getContractFactory("SendCrypto");
    sendCryptoContract = (await SendCrypto.deploy()) as SendCrypto;
    await sendCryptoContract.deployed();

    const TestERC20Token = await ethers.getContractFactory("TestERC20Token");
    testERC20TokenContract = (await TestERC20Token.deploy(ethers.utils.parseEther("1000"))) as TestERC20Token;
    await testERC20TokenContract.deployed();

    testERC20TokenInstance = await new ethers.Contract(
      testERC20TokenContract.address,
      SendCryptoJSON.abi,
      deployer
    );

  });

  it("Can log a message", async () => {
    const tx = await contractEcho
      .connect(wallet)
      .logMessage("0xcd3b766ccdd6ae721141f452c550ca635964ce71", "hello world");
    const txReceipt = await tx.wait();
    console.log(txReceipt);
    console.log(txReceipt.events);
  });
});
