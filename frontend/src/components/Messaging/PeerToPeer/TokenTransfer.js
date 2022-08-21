import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount, useBalance, useNetwork, useSigner } from "wagmi";
import { Oval } from "react-loader-spinner";

import { CONTRACT_META_DATA } from "../../../constants";
import { dropdownIconSVG, usdcIconSVG } from "../../../assets";
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
  const { data } = useBalance({ addressOrName: address });
  const { data: signer } = useSigner();

  const [sendBaseToken, setSendBaseToken] = useState(true);
  const [amtOfToken, setAmtOfToken] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [openTokenTypeDropdown, setOpenTokenTypeDropdown] = useState(false);
  const [isApproved, setApproved] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const toggleOpenTokenTypeDropdown = () =>
    setOpenTokenTypeDropdown(!openTokenTypeDropdown);
  const toggleSendBaseToken = () => setSendBaseToken(!sendBaseToken);

  const handleTokenChange = (e) => setAmtOfToken(e.target.value);

  const contracts = ContractInstance();

  useEffect(() => {
    async function checkApproval() {
      if (
        (
          await contracts.contractUSDC.allowance(
            address,
            CONTRACT_META_DATA[chain.id].contractTokenTransfer
          )
        ).gt(ethers.BigNumber.from(amtOfToken))
      ) {
        setApproved(true);
      }
    }

    checkApproval();
  }, [amtOfToken, sendBaseToken]);

  useEffect(() => {
    async function getTokenBalance() {
      if (sendBaseToken && data) {
        setTokenBalance(data.formatted);
      } else {
        setTokenBalance(
          ethers.utils.formatEther(
            (await contracts.contractUSDC.balanceOf(address)).toString()
          )
        );
      }
    }
    getTokenBalance();
  }, [openModal, sendBaseToken]);

  const getUSDC = async () => {
    const tx = await contracts.contractUSDC.mint(
      address,
      ethers.utils.parseEther("1000")
    );
  };

  const sendToken = async () => {
    setLoading(true);
    let tx;
    if (sendBaseToken) {
      tx = await signer
        .sendTransaction({
          to: activeReceiverAddress,
          value: ethers.utils.parseEther(amtOfToken),
        })
        .catch(() => setLoading(false));
    } else {
      tx = await contracts.contractUSDC
        .transfer(activeReceiverAddress, ethers.utils.parseEther(amtOfToken))
        .catch(() => setLoading(false));
    }
    await tx.wait().then(() => {
      setLoading(false);
      toggleOpenModal();
    });
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => {
        toggleOpenModal();
        toggleOpenTokenTypeDropdown();
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
          <div className="text-xl font-medium">
            Sending {amtOfToken}{" "}
            {sendBaseToken ? CONTRACT_META_DATA[chain.id].baseToken : "USDC"} to{" "}
            {`${activeReceiverAddress.substring(
              0,
              4
            )}...${activeReceiverAddress.substring(38)}`}
          </div>
        </div>
      ) : (
        <div className="flex flex-col py-4 px-4 gap-4">
          <div className="flex flex-row justify-between items-center">
            <code className="text-2xl">Send tokens.</code>
            <button
              className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-[8px]"
              onClick={getUSDC}
            >
              Get USDC
            </button>
          </div>
          <div className="flex flex-row gap-3">
            <div className="flex flex-row">
              <button
                className={
                  "flex justify-center items-center rounded-l-[8px] border border-[#f2f2f2] w-[150px] gap-2 hover:bg-[#eeeeee] " +
                  (openTokenTypeDropdown ? "rounded-bl-[0px]" : "")
                }
                onClick={toggleOpenTokenTypeDropdown}
              >
                {sendBaseToken ? (
                  <>
                    <img
                      className="h-6"
                      src={
                        chain.id in CONTRACT_META_DATA
                          ? CONTRACT_META_DATA[chain.id].logo
                          : ""
                      }
                      alt=""
                    ></img>
                    {chain.id in CONTRACT_META_DATA
                      ? CONTRACT_META_DATA[chain.id].baseToken
                      : ""}
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
              disabled={!amtOfToken}
            >
              Send
            </button>
          </div>
          {openTokenTypeDropdown ? (
            <div className="flex flex-col place-self-start">
              <button
                className="flex justify-center items-center rounded-b-[8px] border border-[#f2f2f2] w-[150px] py-[13px] mt-[-17px] gap-2 hover:bg-[#eeeeee]"
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
          <div className="font-medium">
            Balance: {parseFloat(tokenBalance).toFixed(2)}
          </div>
        </div>
      )}
    </Modal>
  );
}
