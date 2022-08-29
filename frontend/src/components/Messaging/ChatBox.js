import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import SendMessageContainer from "./SendMessageContainer";
import ReceiveMessageContainer from "./ReceiveMessageContainer";
import { ContractInstance } from "../../hooks";
import ERC721JSON from "../../contracts/ERC721.json";

const renderChat = (
  ETH_USD,
  currentETHTime,
  receiverAddress,
  messages,
  acceptOffer,
  cancelOffer,
  updateNFTStatus
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
    let messageData = message;
    let timestamp = messageMetaData.timestamp;
    let messageType = messageMetaData.messageType;
    if (receiverAddressLowerCase === messageMetaData.from) {
      if (messageType === "1") {
        message = (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <code className="text-lg">NFT Offer</code>
              {messageData.offerStatus === 1 ? (
                <div className="flex justify-center items-center text-white text-sm bg-[#27AE60] rounded-[20px] px-3">
                  Accepted
                </div>
              ) : messageData.offerStatus === 2 ? (
                <div className="flex justify-center items-center text-white text-sm bg-[#ff0a00] rounded-[20px] px-3">
                  Cancelled
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col text-sm">
              <div className="font-bold">From</div>
              <code>{messageData.buyer}</code>
            </div>
            <div className="flex flex-row gap-16">
              <div className="flex flex-col text-sm">
                <div className="font-bold">Price</div>
                <code>
                  {ethers.utils.formatEther(
                    ethers.BigNumber.from(messageData.tokenAmount)
                  )}{" "}
                  WETH{" "}
                  <span className="opacity-50">{`($${(
                    ETH_USD *
                    parseFloat(
                      ethers.utils.formatEther(
                        ethers.BigNumber.from(messageData.tokenAmount)
                      )
                    )
                  ).toLocaleString()} USD)`}</span>
                </code>
              </div>
              <div className="flex flex-col text-sm">
                <div className="font-bold">Expires</div>
                <code>
                  {((messageData.timeExpiry - currentETHTime) / 86400).toFixed(
                    2
                  )}{" "}
                  Days
                </code>
              </div>
            </div>
            <div className="flex flex-row gap-[12px]">
              {messageData.imageURL ? (
                <img
                  className="h-[50px] rounded-[5px]"
                  src={messageData.imageURL}
                  alt=""
                ></img>
              ) : (
                <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
              )}
              <div className="flex flex-col text-left">
                <div className="text-lg font-medium">
                  {messageData.name} #{messageData.tokenId}
                </div>
                <div className="text-sm font-medium">
                  Address{" "}
                  {`${messageData.NFTAddress.substring(
                    0,
                    4
                  )}...${messageData.NFTAddress.substring(38)}`}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              {/* {console.log(messageData.offerStatus)}
              {console.log(
                !Boolean(messageData.offerStatus) ||
                  messageData.offerStatus === 0
              )} */}
              {!Boolean(messageData.offerStatus) ||
              messageData.offerStatus === 0 ? (
                <button
                  className="bg-[#27AE60] text-white rounded-[8px] py-2 w-[150px]"
                  onClick={() => {
                    acceptOffer(
                      ethers.BigNumber.from(
                        messageData.tokenAmount.hex
                      ).toString(),
                      messageData.tokenId,
                      messageData.timeExpiry,
                      messageData.buyer,
                      messageData.seller,
                      messageData.tokenAddress,
                      messageData.NFTAddress,
                      messageData.v,
                      messageData.r,
                      messageData.s
                    );
                  }}
                >
                  Accept
                </button>
              ) : (
                <></>
              )}
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
        message = (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <code className="text-lg">NFT Offer</code>
              {messageData.offerStatus === 1 ? (
                <div className="flex justify-center items-center text-white text-sm bg-[#27AE60] rounded-[20px] px-3">
                  Accepted
                </div>
              ) : messageData.offerStatus === 2 ? (
                <div className="flex justify-center items-center text-white text-sm bg-[#ff0a00] rounded-[20px] px-3">
                  Cancelled
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col text-sm">
              <div className="font-bold">To</div>
              <code>{messageData.seller}</code>
            </div>
            <div className="flex flex-row gap-16">
              <div className="flex flex-col text-sm">
                <div className="font-bold">Price</div>
                <code>
                  {ethers.utils.formatEther(
                    ethers.BigNumber.from(messageData.tokenAmount)
                  )}{" "}
                  WETH{" "}
                  <span className="opacity-50">{`($${(
                    ETH_USD *
                    parseFloat(
                      ethers.utils.formatEther(
                        ethers.BigNumber.from(messageData.tokenAmount)
                      )
                    )
                  ).toLocaleString()} USD)`}</span>
                </code>
              </div>
              <div className="flex flex-col text-sm">
                <div className="font-bold">Expires</div>
                <code>
                  {((messageData.timeExpiry - currentETHTime) / 86400).toFixed(
                    2
                  )}{" "}
                  Days
                </code>
              </div>
            </div>
            <div className="flex flex-row gap-[12px]">
              {messageData.imageURL ? (
                <img
                  className="h-[50px] rounded-[5px]"
                  src={messageData.imageURL}
                  alt=""
                ></img>
              ) : (
                <div className="bg-black w-[50px] h-[50px] rounded-[5px]"></div>
              )}
              <div className="flex flex-col text-left">
                <div className="text-lg font-medium">
                  {messageData.name} #{messageData.tokenId}
                </div>
                <div className="text-sm font-medium">
                  Address{" "}
                  {`${messageData.NFTAddress.substring(
                    0,
                    4
                  )}...${messageData.NFTAddress.substring(38)}`}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              {!Boolean(messageData.offerStatus) ||
              messageData.offerStatus === 0 ? (
                <button
                  className="bg-[#ff0a00] text-white rounded-[8px] py-2 w-[150px]"
                  onClick={() => {
                    cancelOffer(
                      ethers.BigNumber.from(
                        messageData.tokenAmount.hex
                      ).toString(),
                      messageData.tokenId,
                      messageData.timeExpiry,
                      messageData.buyer,
                      messageData.seller,
                      messageData.tokenAddress,
                      messageData.NFTAddress,
                      messageData.v,
                      messageData.r,
                      messageData.s
                    );
                  }}
                >
                  Cancel
                </button>
              ) : (
                <></>
              )}
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
  const { data: signer } = useSigner();

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

  const approveNFTTransfer = async (NFTAddress, tokenId) => {
    const NFTContract = new ethers.Contract(NFTAddress, ERC721JSON.abi, signer);

    const tx = await NFTContract.approve(
      contracts.contractRequestNFT.address,
      tokenId
    );

    await tx.wait().then(() => {
      updateNFTStatus();
    });
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
    await approveNFTTransfer(NFTAddress, tokenId);

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

    await tx.wait().then(() => updateNFTStatus());
  };

  const cancelOffer = async (
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
    const data = {
      tokenAmount: tokenAmount,
      tokenId: tokenId,
      timeExpiry: timeExpiry,
      buyer: buyer,
      seller: seller,
      tokenAddress: tokenAddress,
      NFTAddress: NFTAddress,
    };

    const tx = await contracts.contractRequestNFT.cancelOffer(data, v, r, s);

    await tx.wait().then(() => updateNFTStatus());
  };

  const updateNFTStatus = async () => {
    if (Boolean(messages) && activeReceiverAddress in messages) {
      for (var i = 0; i < messages[activeReceiverAddress].length; i++) {
        if (messages[activeReceiverAddress][i].messageType === "1") {
          const data = {
            tokenAmount: messages[activeReceiverAddress][i].message.tokenAmount,
            tokenId: messages[activeReceiverAddress][i].message.tokenId,
            timeExpiry: messages[activeReceiverAddress][i].message.timeExpiry,
            buyer: messages[activeReceiverAddress][i].message.buyer,
            seller: messages[activeReceiverAddress][i].message.seller,
            tokenAddress:
              messages[activeReceiverAddress][i].message.tokenAddress,
            NFTAddress: messages[activeReceiverAddress][i].message.NFTAddress,
          };
          messages[activeReceiverAddress][i].message.offerStatus =
            await contracts.contractRequestNFT.getOfferStatus(data);
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateNFTStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getETHPrice();
    getCurrentETHTime();
  }, [activeReceiverAddress]);

  const chat = renderChat(
    ETH_USD,
    currentETHTime,
    activeReceiverAddress,
    messages,
    acceptOffer,
    cancelOffer,
    updateNFTStatus
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
