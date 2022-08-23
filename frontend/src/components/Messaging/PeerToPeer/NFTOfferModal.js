// import * as dotenv from "dotenv";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { Oval } from "react-loader-spinner";
import Moralis from "moralis";

import { theGraphClient } from "../../../config";
import {
  GQL_QUERY_GET_COMMUNICATION_ADDRESS,
  CONTRACT_META_DATA,
} from "../../../constants";
import { sendMessagesIconSVG, searchIconSVG } from "../../../assets";
import { ContractInstance } from "../../../hooks";

import "./peerToPeer.css";

// dotenv.config();
const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    border: "0px",
    borderRadius: "1.5rem",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
};

export default function NFTOfferModal({
  openModal,
  toggleOpenModal,
  activeReceiverAddress,
}) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [NFTOfferStage, setNFTOfferStage] = useState(0);
  const [NFTsOwned, setNFTsOwned] = useState([]);
  const [NFTAddress, setNFTAddress] = useState("");
  const [NFTTokenIndex, setNFTTokenIndex] = useState();
  const [NFTTokenId, setNFTTokenId] = useState("");
  const [NFTPrice, setNFTPrice] = useState("");
  const [NFTFilter, setNFTFilter] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [ETH_USD, setETH_USD] = useState(0);

  const handleNFTFilterChange = (e) => setNFTFilter(e.target.value);
  const handleNFTPriceChange = (e) => setNFTPrice(e.target.value);

  const contracts = ContractInstance();
  
  useEffect(() => {
    // TODO: this useEffect is fired twice at init this shouldn't
    // If not activeReceiver selected do not fire
    if (activeReceiverAddress == null) {
      return 
    }
    getNFTInfo();
    getETHPrice();
  }, [openModal]);

  // TODO: add to config folder
  const getNFTInfo = async () => {
    await Moralis.start({
      apiKey: process.env.REACT_APP_MORALIS_API_KEY,
    });

    let ownedNFTs = await Moralis.EvmApi.account.getNFTs({
      address: activeReceiverAddress,
      tokenAddress: NFTAddress,
      chain: chain.id,
    });

    ownedNFTs = ownedNFTs._data.result.reverse();

    for (var i = 0; i < ownedNFTs.length; i++) {
      if (ownedNFTs[i].metadata) {
        ownedNFTs[i].imageURL =
          "https://ipfs.io/ipfs/" +
          JSON.parse(ownedNFTs[i].metadata).image.slice(7);
      }
    }

    setNFTsOwned(ownedNFTs);
  };

  
  const getETHPrice = async () => {
    // TODO: add to constants - also is this URL safe to hardcode? what if it changes?
    const ETH_USD_API_ENDPOINT = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=58cddf6c19d0f436c15409ad20c236d10ee173c0b77be1ee4f4a1f6b7c53c843"
    fetch(
      ETH_USD_API_ENDPOINT
    )
      .then((response) => response.json())
      .then((data) => {
        setETH_USD(data.USD);
      });
  };

  const mintNFT = async (receiver) => {
    const tx = await contracts.contractBAYC.safeMint(receiver);
  };

  const getWETH = async () => {
    const tx = await contracts.contractWETH.getWETH();
  };

  const increaseAllowance = async () => {
    // _operator is NFT exchange contract
    // TODO: don't hardcode this
    const _operator = "0x6ef0d67Ca702fAE10E133c885df41F43c3a56136";

    const tx = await contracts.contractWETH.approve(
      _operator,
      ethers.utils.parseEther(NFTPrice)
    );

    await tx
      .wait()
      .then(() => {
        setNFTOfferStage(1);
      })
      .catch((err) => console.log("Error occurred: " + err));
  };

  const signExchangeOffer = async () => {
    const domain = {
      name: "NFTExchange",
      version: "1",
      chainId: chain.id,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };

    const types = {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    };

    const value = {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    const signature = await signer._signTypedData(domain, types, value);
    console.log(signature);
  };

  const handleSendOffer = async () => {
    let senderPublicKey = JSON.parse(
      localStorage.getItem("public-communication-address")
    );
    senderPublicKey = senderPublicKey[address];

    const graphClient = theGraphClient();
    const data = await graphClient
      .query(GQL_QUERY_GET_COMMUNICATION_ADDRESS, {
        receiverAddress: activeReceiverAddress,
      })
      .toPromise();
    const receiverPublicKey = data.data.identities[0].communicationAddress;

    const senderMessage = [NFTAddress, NFTTokenId, NFTPrice].toString();

    let messageEncryptedSender = await EthCrypto.encryptWithPublicKey(
      senderPublicKey,
      senderMessage
    );
    let messageEncryptedReceiver = await EthCrypto.encryptWithPublicKey(
      receiverPublicKey,
      senderMessage
    );

    messageEncryptedSender = EthCrypto.cipher.stringify(messageEncryptedSender);
    messageEncryptedReceiver = EthCrypto.cipher.stringify(
      messageEncryptedReceiver
    );

    // const tx = await contracts.contractEcho.logNFTOffer(
    //   1,
    //   activeReceiverAddress,
    //   messageEncryptedSender,
    //   messageEncryptedReceiver
    // );
    // await tx
    //   .wait()
    //   .then(() => {
    //     setNFTOfferStage(0);
    //     toggleOpenModal();
    //   })
    //   .catch((err) => console.log("Error occurred: " + err));
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => {
        setNFTOfferStage(0);
        toggleOpenModal();
      }}
      style={modalStyles}
    >
      {isLoading ? (
        <div className="flex flex-col w-[384px] items-center justify-center gap-[20px]">
          <Oval
            ariaLabel="loading-indicator"
            height={40}
            width={40}
            strokeWidth={3}
            strokeWidthSecondary={3}
            color="black"
            secondaryColor="white"
          />
          <div className="text-xl font-medium">Sending offer...</div>
        </div>
      ) : (
        <div className="flex flex-col py-4 px-4 gap-4">
          <div className="flex flex-row justify-between items-center">
            <code className="text-2xl">Make NFT offer.</code>
            <div className="flex flex-row gap-[1px]">
              <button
                className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-l-[8px]"
                onClick={() => mintNFT(address)}
              >
                Get NFT
              </button>
              <button
                className="bg-[#333333] text-white p-1 hover:bg-[#555555]"
                onClick={getWETH}
              >
                Get WETH
              </button>
              <button
                className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-r-[8px]"
                onClick={() => mintNFT(activeReceiverAddress)}
              >
                Give NFT
              </button>
            </div>
          </div>
          {NFTOfferStage === 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center">
                <input
                  placeholder={`Search NFT by Name or Address`}
                  onChange={handleNFTFilterChange}
                  className="code w-[600px] px-4 py-3 rounded-l-[8px] bg-[#f2f2f2] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={NFTOfferStage > 0}
                ></input>
                <button
                  onClick={() => {
                    getNFTInfo();
                  }}
                >
                  <img
                    className="h-12 p-3 rounded-r-[8px] bg-[#f2f2f2]"
                    src={searchIconSVG}
                    alt=""
                  ></img>
                </button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[22vh]">
                {NFTsOwned.map((NFT, index) => {
                  if (Boolean(NFTFilter)) {
                    if (
                      NFT.name
                        .toLocaleLowerCase()
                        .includes(NFTFilter.toLocaleLowerCase()) ||
                      NFT.token_address
                        .toLocaleLowerCase()
                        .includes(NFTFilter.toLocaleLowerCase()) ||
                      (
                        NFT.name.toLocaleLowerCase() +
                        " #" +
                        NFT.token_id.toLocaleLowerCase()
                      ).includes(NFTFilter.toLocaleLowerCase())
                    ) {
                      return (
                        <button
                          className="border-gradient"
                          onClick={() => {
                            setNFTTokenIndex(index);
                            setNFTOfferStage(1);
                          }}
                        >
                          {NFT.token_uri === null ? (
                            <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
                          ) : (
                            <img src={NFT.imageURL} alt=""></img>
                          )}
                          <div className="flex flex-col text-left">
                            <div className="text-lg font-medium">
                              {NFT.name} #{NFT.token_id}
                            </div>
                            <div className="text-sm font-medium">
                              Address{" "}
                              {`${NFT.token_address.substring(
                                0,
                                4
                              )}...${NFT.token_address.substring(38)}`}
                            </div>
                          </div>
                        </button>
                      );
                    } else {
                      return "";
                    }
                  } else {
                    return (
                      <button
                        className="border-gradient"
                        onClick={() => {
                          setNFTTokenIndex(index);
                          setNFTOfferStage(1);
                        }}
                      >
                        {NFT.token_uri === null ? (
                          <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
                        ) : (
                          <img
                            className="h-[50px] rounded-[5px]"
                            src={NFT.imageURL}
                            alt=""
                          ></img>
                        )}
                        <div className="flex flex-col text-left">
                          <div className="text-lg font-medium">
                            {NFT.name} #{NFT.token_id}
                          </div>
                          <div className="text-sm font-medium">
                            Address{" "}
                            {`${NFT.token_address.substring(
                              0,
                              4
                            )}...${NFT.token_address.substring(38)}`}
                          </div>
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          ) : (
            <></>
          )}
          {NFTOfferStage === 1 ? (
            <>
              <div className="border-gradient-always" onClick={() => {}}>
                {NFTsOwned[NFTTokenIndex].token_uri === null ? (
                  <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
                ) : (
                  <img
                    className="h-[50px] rounded-[5px]"
                    src={NFTsOwned[NFTTokenIndex].imageURL}
                    alt=""
                  ></img>
                )}
                <div className="flex flex-col text-left">
                  <div className="text-lg font-medium">
                    {NFTsOwned[NFTTokenIndex].name} #
                    {NFTsOwned[NFTTokenIndex].token_id}
                  </div>
                  <div className="text-sm font-medium">
                    Address{" "}
                    {`${NFTsOwned[NFTTokenIndex].token_address.substring(
                      0,
                      4
                    )}...${NFTsOwned[NFTTokenIndex].token_address.substring(
                      38
                    )}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3 w-[650px]">
                <input
                  placeholder={`1 WETH ($${ETH_USD} USD)`}
                  onChange={handleNFTPriceChange}
                  className="code px-4 py-3 w-[467px] rounded-[8px] bg-[#f2f2f2] disabled:opacity-50 disabled:cursor-not-allowed"
                ></input>
                <button
                  className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setLoading(true);
                    increaseAllowance();
                    signExchangeOffer();
                    handleSendOffer();
                  }}
                  disabled={!Boolean(NFTPrice)}
                >
                  Send offer
                  <img className="h-[25px]" src={sendMessagesIconSVG}></img>
                </button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      )}
    </Modal>
  );
}
