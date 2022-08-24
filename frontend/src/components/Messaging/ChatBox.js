import { useAccount, useProvider } from "wagmi";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import SendMessageContainer from "./SendMessageContainer";
import ReceiveMessageContainer from "./ReceiveMessageContainer";
import { ContractInstance } from "../../hooks";

const renderChat = (
  ETH_USD,
  currentETHTime,
  receiverAddress,
  messages,
  acceptOffer
) => {
  const chatJSX = [];

  if (receiverAddress == null) {
    return [];
  }
  const receiverAddressLowerCase = receiverAddress.toLowerCase();
  const messageLog = messages[receiverAddress];

  if (messageLog == null) {
    return [];
  }

  for (let idx = 0; idx < messageLog.length; idx++) {
    let messageMetaData = messageLog[idx];
    let message = messageMetaData.message;
    let timestamp = messageMetaData.timestamp;
    let messageType = messageMetaData.messageType;
    if (receiverAddressLowerCase === messageMetaData.from) {
      if (messageType === "1") {
        const messageJSON = JSON.parse(messageMetaData.message);
        message = (
          <div className="flex flex-col gap-4">
            <code className="text-lg">NFT Offer</code>
            <div className="flex flex-col text-sm">
              <div className="font-bold">From</div>
              <code>{messageJSON.buyer}</code>
            </div>
            <div className="flex flex-row gap-16">
              <div className="flex flex-col text-sm">
                <div className="font-bold">Price</div>
                <code>
                  {ethers.utils.formatEther(
                    ethers.BigNumber.from(messageJSON.tokenAmount)
                  )}{" "}
                  WETH{" "}
                  <span className="opacity-50">{`($${(
                    ETH_USD *
                    parseFloat(
                      ethers.utils.formatEther(
                        ethers.BigNumber.from(messageJSON.tokenAmount)
                      )
                    )
                  ).toLocaleString()} USD)`}</span>
                </code>
              </div>
              <div className="flex flex-col text-sm">
                <div className="font-bold">Expires</div>
                <code>
                  {((messageJSON.timeExpiry - currentETHTime) / 86400).toFixed(
                    2
                  )}{" "}
                  Days
                </code>
              </div>
            </div>
            <div className="flex flex-row gap-[12px]">
              {messageJSON.imageURL ? (
                <img
                  className="h-[50px] rounded-[5px]"
                  src={messageJSON.imageURL}
                  alt=""
                ></img>
              ) : (
                <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
              )}
              <div className="flex flex-col text-left">
                <div className="text-lg font-medium">
                  {messageJSON.name} #{messageJSON.tokenId}
                </div>
                <div className="text-sm font-medium">
                  Address{" "}
                  {`${messageJSON.NFTAddress.substring(
                    0,
                    4
                  )}...${messageJSON.NFTAddress.substring(38)}`}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-[#27AE60] text-white rounded-[8px] py-2 w-[150px]"
                onClick={() => {
                  acceptOffer(
                    ethers.BigNumber.from(
                      messageJSON.tokenAmount.hex
                    ).toString(),
                    messageJSON.tokenId,
                    messageJSON.timeExpiry,
                    messageJSON.buyer,
                    messageJSON.seller,
                    messageJSON.tokenAddress,
                    messageJSON.NFTAddress,
                    messageJSON.v,
                    messageJSON.r,
                    messageJSON.s
                  );
                }}
              >
                Accept
              </button>
            </div>
          </div>
        );
      }

      chatJSX.push(
        <ReceiveMessageContainer
          receiverAddress={receiverAddressLowerCase}
          message={message}
          timestamp={timestamp}
          key={idx}
        />
      );
    } else {
      if (messageType === "1") {
        message = JSON.parse(messageMetaData.message);
        message = (
          <div className="flex flex-col gap-4">
            <code className="text-lg">NFT Offer</code>
            <div className="flex flex-col text-sm">
              <div className="font-bold">To</div>
              <code>{message.seller}</code>
            </div>
            <div className="flex flex-row gap-16">
              <div className="flex flex-col text-sm">
                <div className="font-bold">Price</div>
                <code>
                  {ethers.utils.formatEther(
                    ethers.BigNumber.from(message.tokenAmount)
                  )}{" "}
                  WETH{" "}
                  <span className="opacity-50">{`($${(
                    ETH_USD *
                    parseFloat(
                      ethers.utils.formatEther(
                        ethers.BigNumber.from(message.tokenAmount)
                      )
                    )
                  ).toLocaleString()} USD)`}</span>
                </code>
              </div>
              <div className="flex flex-col text-sm">
                <div className="font-bold">Expires</div>
                <code>
                  {((message.timeExpiry - currentETHTime) / 86400).toFixed(2)}{" "}
                  Days
                </code>
              </div>
            </div>
            <div className="flex flex-row gap-[12px]">
              {message.imageURL ? (
                <img
                  className="h-[50px] rounded-[5px]"
                  src={message.imageURL}
                  alt=""
                ></img>
              ) : (
                <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
              )}
              <div className="flex flex-col text-left">
                <div className="text-lg font-medium">
                  {message.name} #{message.tokenId}
                </div>
                <div className="text-sm font-medium">
                  Address{" "}
                  {`${message.NFTAddress.substring(
                    0,
                    4
                  )}...${message.NFTAddress.substring(38)}`}
                </div>
              </div>
            </div>
          </div>
        );
      }
      chatJSX.push(
        <SendMessageContainer
          message={message}
          timestamp={timestamp}
          key={idx}
        />
      );
    }
  }
  return chatJSX;
};

const ChatBox = ({ activeReceiverAddress, messages }) => {
  const provider = useProvider();

  const [ETH_USD, setETH_USD] = useState(0);
  const [currentETHTime, setCurrentETHTime] = useState(0);

  const contracts = ContractInstance();

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

  const approveNFTTransfer = async (tokenId) => {
    const tx = await contracts.contractBAYC.approve(
      contracts.contractRequestNFT.address,
      tokenId
    );

    await tx.wait();
  };

  const acceptOffer = async (
    tokenAmount,
    tokenId,
    timeExpiry,
    buyer,
    seller,
    tokenAddress,
    NFTAddress,
    v,
    r,
    s
  ) => {
    await approveNFTTransfer(tokenId);

    const data = {
      tokenAmount: tokenAmount,
      tokenId: tokenId,
      timeExpiry: timeExpiry,
      buyer: buyer,
      seller: seller,
      tokenAddress: tokenAddress,
      NFTAddress: NFTAddress,
    };

    const tx = await contracts.contractRequestNFT.exchange(data, v, r, s);

    await tx.wait();
  };

  useEffect(() => {
    getETHPrice();
    getCurrentETHTime();
  }, [messages]);

  const chat = renderChat(
    ETH_USD,
    currentETHTime,
    activeReceiverAddress,
    messages,
    acceptOffer
  );

  if (activeReceiverAddress in messages) {
    messages[activeReceiverAddress].reverse();
  }

  return (
    <div className="absolute flex flex-col-reverse overflow-y-scroll w-full bottom-[88px] h-[72vh]">
      {chat}
    </div>
  );
};

export default ChatBox;
