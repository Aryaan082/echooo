// import * as dotenv from "dotenv";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import { Oval } from "react-loader-spinner";
import Moralis from "moralis";
import moment from "moment";

import { theGraphClient } from "../../../config";
import {
  GQL_QUERY_GET_COMMUNICATION_ADDRESS,
  CONTRACT_META_DATA,
} from "../../../constants";
import {
  usdcIconSVG,
  ethereumIconSVG,
  sendMessagesIconSVG,
} from "../../../assets";
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

export default function LendingOfferModal({
  openModal,
  toggleOpenModal,
  activeReceiverAddress,
  messages,
  setMessageLog,
  messagesState,
  setMessagesState,
}) {
  const { address } = useAccount();
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [isLoading, setLoading] = useState(false);
  const [ETH_USD, setETH_USD] = useState(0);
  const [tokenAmt, setTokenAmt] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [currentETHTime, setCurrentETHTime] = useState(0);
  const [maturityDay, setMaturityDay] = useState(0);
  const [USDCBalance, setUSDCBalance] = useState(0);
  const [WETHBalance, setWETHBalance] = useState(0);
  const [supplyAsset, setSupplyAsset] = useState("");

  const handleTokenAmtChange = (e) => setTokenAmt(e.target.value);
  const handleInterestRateChange = (e) => setInterestRate(e.target.value);
  const handleMaturityDayChange = (e) => setMaturityDay(e.target.value);

  const contracts = ContractInstance();

  useEffect(() => {
    // TODO: this useEffect is fired twice at init this shouldn't
    // If not activeReceiver selected do not fire
    if (activeReceiverAddress == null) {
      return;
    }

    getETHPrice();
    getCurrentETHTime();
    getUSDCBalance();
    getWETHBalance();
  });

  const getWETHBalance = async () => {
    setWETHBalance(
      parseFloat(
        ethers.utils.formatEther(
          (await contracts.contractWETH.balanceOf(address)).toString()
        )
      ).toFixed(2)
    );
  };

  const getUSDCBalance = async () => {
    setUSDCBalance(
      parseFloat(
        ethers.utils.formatEther(
          (await contracts.contractUSDC.balanceOf(address)).toString()
        )
      ).toFixed(2)
    );
  };

  const getETHPrice = async () => {
    // TODO: add to constants - also is this URL safe to hardcode? what if it changes?
    const ETH_USD_API_ENDPOINT =
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=58cddf6c19d0f436c15409ad20c236d10ee173c0b77be1ee4f4a1f6b7c53c843";
    fetch(ETH_USD_API_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        setETH_USD(data.USD);
      });
  };

  const getCurrentETHTime = async () => {
    setCurrentETHTime((await provider.getBlock()).timestamp);
  };

  const getWETH = async () => {
    const tx = await contracts.contractWETH.getWETH();
  };

  const getUSDC = async () => {
    const tx = await contracts.contractUSDC.mint(
      address,
      ethers.utils.parseEther("1000")
    );
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => {
        setLoading(false);
        setSupplyAsset("");
        setTokenAmt(0);
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
        <div className="flex flex-col py-4 px-4 gap-4 w-[600px]">
          <div className="flex flex-row justify-between items-center">
            <code className="text-2xl">Make lending offer.</code>
            <div className="flex flex-row gap-[1px]">
              <button
                className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-l-[8px]"
                onClick={getWETH}
              >
                Get WETH
              </button>
              <button
                className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-r-[8px]"
                onClick={getUSDC}
              >
                Get USDC
              </button>
            </div>
          </div>
          {!Boolean(supplyAsset) ? (
            <>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row font-semibold items-center gap-2">
                  <img className="h-8" src={usdcIconSVG} alt=""></img>USDC
                </div>
                <div className="font-medium">{USDCBalance}</div>
                <button
                  className="flex items-center text-white bg-[#333333] rounded-[8px] hover:bg-[#555555] font-medium px-3 py-2"
                  onClick={() => setSupplyAsset("USDC")}
                >
                  Supply
                </button>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row font-semibold items-center gap-2">
                  <img className="h-8" src={ethereumIconSVG} alt=""></img>WETH
                </div>
                <div className="font-medium">{WETHBalance}</div>
                <button
                  className="flex items-center text-white bg-[#333333] rounded-[8px] hover:bg-[#555555] font-medium px-3 py-2"
                  onClick={() => setSupplyAsset("WETH")}
                >
                  Supply
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <div>Amount</div>
                <div className="flex flex-row">
                  <div className="flex flex-col py-3 bg-[#f2f2f2] justify-center rounded-l-[8px]">
                    <input
                      placeholder="0.00"
                      onChange={handleTokenAmtChange}
                      className="code w-[440px] px-4 rounded-l-[8px] bg-[#f2f2f2] text-xl"
                    ></input>
                    <div className="code px-4 text-xs text-[#888888]">
                      $
                      {tokenAmt === ""
                        ? 0
                        : supplyAsset === "USDC"
                        ? tokenAmt
                        : tokenAmt * ETH_USD}
                    </div>
                  </div>
                  <div className="flex flex-col bg-[#f2f2f2] justify-center rounded-r-[8px]">
                    <div className="flex flex-row items-center gap-2 px-4">
                      <img
                        className="h-8"
                        src={
                          supplyAsset === "USDC" ? usdcIconSVG : ethereumIconSVG
                        }
                        alt=""
                      ></img>
                      <div className="text-lg font-semibold">{supplyAsset}</div>
                    </div>
                    <div className="self-end px-4 text-xs text-[#888888]">
                      Balance:{" "}
                      {supplyAsset === "USDC" ? USDCBalance : WETHBalance}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div>Supply APY</div>
                <div className="flex flex-row gap-11 items-center">
                  <input
                    placeholder="3.14"
                    onChange={handleInterestRateChange}
                    className="code w-[100px] px-4 py-3 rounded-[8px] bg-[#f2f2f2] text-xl"
                  ></input>
                  <div className="text-xl font-bold">%</div>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div>Maturity Day</div>
                <div className="flex flex-row gap-4 items-center">
                  <input
                    placeholder="7"
                    onChange={handleMaturityDayChange}
                    className="code w-[100px] px-4 py-3 rounded-[8px] bg-[#f2f2f2] text-xl"
                  ></input>
                  <div className="text-xl font-bold">Days</div>
                </div>
              </div>
              <button className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                Send Offer <img src={sendMessagesIconSVG} alt=""></img>
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
