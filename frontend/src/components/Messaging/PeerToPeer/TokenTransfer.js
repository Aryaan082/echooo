import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount } from "wagmi";
import { Oval } from "react-loader-spinner";

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

export default function TokenTransfer({
  openModal,
  toggleOpenModal,
  activeReceiverAddress,
}) {
  const { address } = useAccount();

  const [amtOfETH, setAmtOfETH] = useState("");

  const handleETHChange = (e) => setAmtOfETH(e.target.value);

  const contracts = ContractInstance();

  const getWETH = async () => {
    const tx = await contracts.contractWETH.getWETH();
  };

  const sendETH = async () => {
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
      onRequestClose={toggleOpenModal}
      style={modalStyles}
    >
      <div className="flex flex-col py-4 px-4 gap-4">
        <div className="flex flex-row justify-between items-center">
          <code className="text-2xl">Send tokens.</code>
          <button
            className="bg-[#333333] text-white p-1 hover:bg-[#555555]"
            onClick={sendETH}
          >
            Get WETH
          </button>
        </div>
        <input
          placeholder="Search token address..."
          onChange={handleETHChange}
          className="code px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
        ></input>
        <div className="flex flex-row gap-3">
          <input
            placeholder="How much would you like to send..."
            onChange={handleETHChange}
            className="code w-[450px] px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
          ></input>
          <button
            className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            // onClick={getWETH}
          >
            Send
          </button>
        </div>
      </div>
    </Modal>
  );
}
