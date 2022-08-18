import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount, useNetwork } from "wagmi";
import { Oval } from "react-loader-spinner";

import { CONTRACT_META_DATA } from "../../../constants";
import { continueIconSVG, dropdownIconSVG, usdcIconSVG } from "../../../assets";
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
  const { chain } = useNetwork();

  const [sendBaseToken, setSendBaseToken] = useState(true);
  const [amtOfToken, setAmtOfToken] = useState("");
  const [openTokenTypeDropdown, setOpenTokenTypeDropdown] = useState(false);

  const toggleOpenTokenTypeDropdown = () =>
    setOpenTokenTypeDropdown(!openTokenTypeDropdown);
  const toggleSendBaseToken = () => setSendBaseToken(!sendBaseToken);

  const handleTokenChange = (e) => setAmtOfToken(e.target.value);

  const contracts = ContractInstance();

  const getWETH = async () => {
    const tx = await contracts.contractWETH.getWETH();
  };

  const sendToken = async () => {
    console.log("HI");
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
            className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-[8px]"
            onClick={getWETH}
          >
            Get WETH
          </button>
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex flex-row">
            <button
              className="flex justify-center items-center rounded-l-[8px] border border-[#f2f2f2] px-3 gap-2"
              onClick={toggleOpenTokenTypeDropdown}
            >
              {sendBaseToken ? (
                <>
                  <img
                    className="h-6"
                    src={CONTRACT_META_DATA[chain.id].logo}
                    alt=""
                  ></img>
                  {CONTRACT_META_DATA[chain.id].baseToken}
                </>
              ) : (
                <>
                  <img className="h-6" src={usdcIconSVG} alt=""></img>USDC
                </>
              )}
              <img src={dropdownIconSVG} alt=""></img>
            </button>
            <input
              placeholder="How much would you like to send"
              onChange={handleTokenChange}
              className="code w-[450px] px-4 py-3 rounded-r-[8px] bg-[#f2f2f2]"
            ></input>
          </div>
          <button
            className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={sendToken}
          >
            Send
          </button>
        </div>
        {openTokenTypeDropdown ? (
          <div className="flex flex-col place-self-start">
            <button
              className="flex justify-center items-center border border-[#f2f2f2] p-2 gap-2 mt-[-16px] ml-[10px]"
              onClick={() => {
                toggleSendBaseToken();
                toggleOpenTokenTypeDropdown();
              }}
            >
              {sendBaseToken ? (
                <>
                  <img className="h-6" src={usdcIconSVG} alt=""></img>USDC
                </>
              ) : (
                <>
                  <img
                    className="h-6"
                    src={CONTRACT_META_DATA[chain.id].logo}
                    alt=""
                  ></img>
                  {CONTRACT_META_DATA[chain.id].baseToken}
                </>
              )}
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
}
