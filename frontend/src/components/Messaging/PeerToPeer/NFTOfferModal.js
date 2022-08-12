import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount, useContract, useSigner } from "wagmi";
import { Oval } from "react-loader-spinner";

import { theGraphClient } from "../../../config";
import { GQL_QUERY_GET_COMMUNICATION_ADDRESS } from "../../../constants";
import { continueIconSVG, searchIconSVG } from "../../../assets";
import { ContractInstance } from "../../../hooks";

import TestERC721Token from "../../../contracts/TestERC721Token.json";

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
  const { data: signer } = useSigner();

  const [NFTOfferStage, setNFTOfferStage] = useState(0);
  const [NFTAddress, setNFTAddress] = useState("");
  const [NFTTokenId, setNFTTokenId] = useState("");
  const [NFTPrice, setNFTPrice] = useState("");
  const [NFTName, setNFTName] = useState("");
  const [NFTSymbol, setNFTSymbol] = useState("");
  const [NFTBalanceOfReceiver, setNFTBalanceOfReceiver] = useState("");

  const handleNFTAddressChange = (e) => setNFTAddress(e.target.value);
  const handleNFTTokenIdChange = (e) => setNFTTokenId(e.target.value);
  const handleNFTPriceChange = (e) => setNFTPrice(e.target.value);

  const contracts = ContractInstance();

  const NFTContract = async () => {
    const nftContract = new ethers.Contract(
      NFTAddress,
      TestERC721Token.abi,
      signer
    );

    setNFTName(await nftContract.name());
    setNFTSymbol(await nftContract.symbol());
    setNFTBalanceOfReceiver(
      (await nftContract.balanceOf(activeReceiverAddress)).toString()
    );
  };

  const getNFTInfo = async () => {};

  const mintNFT = async (receiver) => {
    const tx = await contracts.contractNFT.safeMint(receiver);
  };

  const getWETH = async () => {
    const tx = await contracts.contractWETH.getWETH();
  };

  const increaseAllowance = async () => {
    // _operator is NFT exchange contract
    const _operator = "0x6ef0d67Ca702fAE10E133c885df41F43c3a56136";
    console.log(
      ethers.BigNumber.from(NFTPrice)
        .mul(ethers.BigNumber.from(10).pow(ethers.BigNumber.from(18)))
        .toString()
    );
    const tx = await contracts.contractWETH.approve(
      _operator,
      ethers.BigNumber.from(NFTPrice).mul(
        ethers.BigNumber.from(10).pow(ethers.BigNumber.from(18))
      )
    );

    await tx
      .wait()
      .then(() => {
        setNFTOfferStage(1);
      })
      .catch((err) => console.log("Error occurred: " + err));
  };

  const signOffer = async () => {
    setNFTOfferStage(2);
  };

  const createNFTOffer = async () => {
    let senderPublicKey = JSON.parse(
      localStorage.getItem("public-communication-address")
    );
    senderPublicKey = senderPublicKey[address];

    // Query for the receiver's communication public key
    const identitiesQuery = `
      query {
        identities(where: {from: "${activeReceiverAddress}"}, first: 1, orderBy: timestamp, orderDirection: desc) {
          communicationAddress,
          timestamp     
        }
      }
    `;

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

    const tx = await contracts.contractEcho.logNFTOffer(
      1,
      activeReceiverAddress,
      messageEncryptedSender,
      messageEncryptedReceiver
    );
    await tx
      .wait()
      .then(() => {
        setNFTOfferStage(0);
        toggleOpenModal();
      })
      .catch((err) => console.log("Error occurred: " + err));
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={toggleOpenModal}
      style={modalStyles}
    >
      <div className="flex flex-col py-4 px-4 gap-4">
        <div className="flex flex-row justify-between items-center">
          <code className="text-2xl">Make NFT offer.</code>
          <div className="flex flex-row gap-[1px]">
            <button
              className="bg-[#333333] text-white p-1 hover:bg-[#555555]"
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
              className="bg-[#333333] text-white p-1 hover:bg-[#555555]"
              onClick={() => mintNFT(activeReceiverAddress)}
            >
              Give NFT
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <input
            placeholder="Search NFT from..."
            onChange={handleNFTAddressChange}
            className="code w-[600px] px-4 py-3 rounded-l-[8px] bg-[#f2f2f2] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={NFTOfferStage > 0}
          ></input>
          <button
            onClick={() => {
              NFTContract();
              setNFTOfferStage(1);
            }}
            disabled={NFTAddress.length !== 42 || NFTOfferStage > 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              className="h-12 p-3 rounded-r-[8px] bg-[#f2f2f2]"
              src={searchIconSVG}
            ></img>
          </button>
        </div>
        <div>0xd1f246258155d114f9B7C369A9d32eb0feA17aE5</div>
        {NFTOfferStage > 0 ? (
          <div>
            <div>{NFTName}</div>
            <div>
              {NFTName} by {}
            </div>
            <div>{NFTBalanceOfReceiver}</div>
          </div>
        ) : (
          <></>
        )}

        {/* <div className="flex flex-row gap-4">
            <button
              className={
                "flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#555555] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" +
                (NFTOfferStage > 0 ? " disabled:bg-green-700" : "")
              }
              onClick={increaseAllowance}
              disabled={NFTOfferStage !== 0}
            >
              Increase Allowance
            </button>
            <button
              className={
                "flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#555555] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" +
                (NFTOfferStage > 1 ? " disabled:bg-green-700" : "")
              }
              onClick={signOffer}
              disabled={NFTOfferStage !== 1}
            >
              Sign Offer
            </button>
            <button
              className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#555555] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={createNFTOffer}
              disabled={NFTOfferStage !== 2}
            >
              Send Offer
            </button>
          </div> */}
      </div>
    </Modal>
  );
}
