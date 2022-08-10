import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount } from "wagmi";
import { Oval } from "react-loader-spinner";

import { theGraphClient } from "../../../config";
import { GQL_QUERY_GET_COMMUNICATION_ADDRESS } from "../../../constants";
import { continueIconSVG } from "../../../assets";
import { ContractInstance } from "../../../hooks";

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

  const [NFTOfferStage, setNFTOfferStage] = useState(0);
  const [NFTAddress, setNFTAddress] = useState("");
  const [NFTTokenId, setNFTTokenId] = useState("");
  const [NFTPrice, setNFTPrice] = useState("");

  const handleNFTAddressChange = (e) => setNFTAddress(e.target.value);
  const handleNFTTokenIdChange = (e) => setNFTTokenId(e.target.value);
  const handleNFTPriceChange = (e) => setNFTPrice(e.target.value);

  const contracts = ContractInstance();

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
          <button onClick={getWETH}>Get WETH</button>
        </div>
        <div className="flex flex-col gap-3">
          <code className="flex flex-col">
            Address:
            <input
              placeholder="NFT address"
              onChange={handleNFTAddressChange}
              className="code w-full px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
            ></input>
          </code>
          <code className="flex flex-col">
            Token Id:
            <input
              placeholder="Token Id"
              onChange={handleNFTTokenIdChange}
              className="code w-full px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
            ></input>
          </code>
          <code className="flex flex-col">
            Price(Ξ):
            <input
              placeholder="Price"
              onChange={handleNFTPriceChange}
              className="code w-full px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
            ></input>
          </code>
          <div className="flex flex-row gap-4">
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
          </div>
        </div>
      </div>
    </Modal>
  );
}
