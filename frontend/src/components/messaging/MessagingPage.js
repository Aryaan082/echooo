import React, {useEffect, useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import EthCrypto from "eth-crypto";
import { theGraphClient } from "../../config";

import FriendsList from "./MessagingPageFriendsList";
import MessageSender from "./MessageSender";
import ChatBox from "./ChatBox";
import {
  CONTRACT_META_DATA,
  BURNER_ADDRESS,
  GQL_QUERY_IDENTITY_TIMESTAMP_RECENT,
  GQL_QUERY_MESSAGE_LOG_INTERVAL,
  GQL_QUERY_MESSAGE_LOG_INIT
} from "../../constants";

import {
  logoutIconSVG,
  textBubbleSVG,
  dropdownIconSVG,
  echoooLogoSVG,
  errorIconSVG,
  changeKeysIconSVG,
} from "../../assets";
import "./receivers.css";

const intervalGetMessages = async (address, newMessage, activeReceiverAddress, setMessageLog) => {
  const senderAddress = address.toLowerCase();
  console.log("new message active interval >>>", newMessage[activeReceiverAddress])
  if (Object.keys(newMessage).length === 0 || newMessage == null) {
    return;
  }

  const mostRecentMessageMeta = newMessage[activeReceiverAddress].at(-1);
  let senderPrivateKey = JSON.parse(
    localStorage.getItem("private-communication-address")
  );
  senderPrivateKey = senderPrivateKey[address];

  console.log("most recent message meta interval >>>", mostRecentMessageMeta)

  const graphClient =  await theGraphClient();
  const dataMessages = await graphClient.query(GQL_QUERY_MESSAGE_LOG_INTERVAL,
    {
      senderAddress: senderAddress,
      receiverAddress: activeReceiverAddress,
      recentMessageTimestamp: mostRecentMessageMeta.timestamp
    }).toPromise();
  const dataMessagesParsed = dataMessages.data.messages;
  console.log("data messages parsed interval >>>", dataMessages);
  const messageLog = dataMessagesParsed;
  for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
    let metaDataMessages = await dataMessagesParsed[idx];
    let message = "";

    // Decrypt sender message
    if (metaDataMessages.from === senderAddress) {
      message = metaDataMessages.senderMessage;
    } else {
      // Decrypt receiver message
      message = metaDataMessages.receiverMessage;
    }

    const decryptedMessage = await EthCrypto.decryptWithPrivateKey(
      senderPrivateKey,
      EthCrypto.cipher.parse(message)
    );
    messageLog[idx].message = decryptedMessage;
  }
  const newReceiverMessages = [
    ...newMessage[activeReceiverAddress],
    ...messageLog,
  ];
  const newMessageLog = {
    ...newMessage,
    [activeReceiverAddress]: newReceiverMessages,
  };
  setMessageLog(newMessageLog);
}

export default function MessagingPage({
  toggleOpenModalChainSelect,
  toggleOpenCommAddressModal,
  toggleOpenNewChatModal,
  chatAddresses,
  activeReceiverAddress,
  setActiveReceiver,
  activeIndex,
  setActiveIndex,
  communicationAddress,
  setChatAddresses,
  messagesState,
  setMessagesState,
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { chains } = useSwitchNetwork();
  const [messages, setMessageLog] = useState({});

  
  useEffect(() => {
    if (
      activeReceiverAddress === BURNER_ADDRESS
    ) {
      return;
    }
    const getMessagesAsync = async () => {
      const senderAddress = address.toLowerCase();
      let senderPrivateKey = JSON.parse(
        localStorage.getItem("private-communication-address")
      );
      senderPrivateKey = senderPrivateKey[address];
      if (messages[activeReceiverAddress] == null) {

        // TODO: query validation using native library to prevent query injection vulnerability

        const graphClient = await theGraphClient();
        const dataIdentity = await graphClient
          .query(GQL_QUERY_IDENTITY_TIMESTAMP_RECENT, { senderAddress: senderAddress })
          .toPromise();

        const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;

        const dataMessages = await graphClient.query(GQL_QUERY_MESSAGE_LOG_INIT, {
          senderAddress: senderAddress,
          receiverAddress: activeReceiverAddress,
          recentTimestamp: dataIdentityTimestamp
        }).toPromise();
        const dataMessagesParsed = dataMessages.data.messages;

        const messageLog = dataMessagesParsed;
        for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
          let metaDataMessages = await dataMessagesParsed[idx];
          let message = "";

          // Decrypt sender message
          if (metaDataMessages.from === senderAddress) {
            message = metaDataMessages.senderMessage;
          } else {
            // Decrypt receiver message
            message = metaDataMessages.receiverMessage;
          }

          const decryptedMessage = await EthCrypto.decryptWithPrivateKey(
            senderPrivateKey,
            EthCrypto.cipher.parse(message)
          );
          messageLog[idx].message = decryptedMessage;

          console.log(`Decrypted message ${idx} >>>`, decryptedMessage);
        }
        const newMessageLog = {
          ...messages,
          [activeReceiverAddress]: messageLog,
        };

        console.log(messageLog);
        setMessageLog(newMessageLog);
        const interval = setInterval(async (senderAddress, newMessage, activeReceiverAddress, setMessageLog) => intervalGetMessages(senderAddress, newMessage, activeReceiverAddress, setMessageLog),
        5 * 1000,
        address,  
        newMessageLog,
        activeReceiverAddress,
        setMessageLog
        );
        return () => clearInterval(interval);
      }
    };

    if (activeReceiverAddress !== "") {
      getMessagesAsync();
    }
  }, [activeReceiverAddress]);

  // TODO: Break this up into a bunch of components, way too much code here
  // - could do left column, header, and right column as a component
  return (
    <div
      className="flex flex-row h-[100vh] w-[100vw] bg-gradient-bg"
      style={{ backgroundRepeat: "round" }}
    >
      <FriendsList
        chatAddresses={chatAddresses}
        setChatAddresses={setChatAddresses}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        setActiveReceiver={setActiveReceiver}
      />
      {/* Header */}
      <div className="w-[70%] flex flex-col justify-between">
        <div>
          <div className="flex flex-row justify-between items-center px-[20px] py-[40px] h-[100px]">
            {/* Logo */}
            <img className="h-[30px]" src={echoooLogoSVG} alt=""></img>
            {/* Buttons
              1. Chain Selector - Displays Chain
              2. Disconnect - Displays Address
              3. Change Comm Key
              4. Start New Chat
            */}
            <div className="flex flex-row gap-4">
              <button
                className="flex flex-row justify-center items-center gap-[15px] px-5 py-3 bg-white text-black font-bold rounded-[30px]"
                onClick={toggleOpenModalChainSelect}
              >
                {!chains.map((value) => value.id).includes(chain.id) ? (
                  <>
                    <img className="w-[25px]" src={errorIconSVG} alt=""></img>
                    Unsupported Chain
                    <img src={dropdownIconSVG} alt=""></img>
                  </>
                ) : (
                  <>
                    <img
                      className="w-[25px]"
                      src={CONTRACT_META_DATA[chain.id].logo}
                      alt=""
                    ></img>
                    {CONTRACT_META_DATA[chain.id].name}
                    <img src={dropdownIconSVG} alt=""></img>
                  </>
                )}
              </button>
              <button
                className="flex flex-row justify-center items-center gap-[10px] px-5 py-3 bg-white text-black font-bold rounded-[30px]"
                onClick={() => disconnect()}
              >
                {`${address.substring(0, 4)}...${address.substring(38)}`}
                <img src={logoutIconSVG} alt=""></img>
              </button>
              <button
                className="flex flex-row justify-center items-center gap-[10px] px-5 py-3 bg-[rgb(44,157,218)] text-white font-bold rounded-[30px]"
                onClick={toggleOpenCommAddressModal}
              >
                Change keys
                <img
                  className="h-[20px] w-[20px]"
                  src={changeKeysIconSVG}
                  alt=""
                ></img>
              </button>
              {communicationAddress ? (
                <>
                  <button
                    className="flex flex-row justify-center items-center gap-[15px] px-5 py-3 bg-gradient-to-r from-[#00FFD1] to-[#FF007A] via-[#9b649c] text-white font-bold rounded-[30px]"
                    onClick={toggleOpenNewChatModal}
                  >
                    Start new chat
                    <img src={textBubbleSVG} alt=""></img>
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          {/* Reciever */}
          {address in chatAddresses && chatAddresses[address].length > 0 ? (
            <div className="w-full" style={{ height: "calc(5vh - 100px}" }}>
              <div className="flex justify-center align-center">
                <div className="shadow-md flex flex-wrap rounded-[10px] border-[1px] p-5 bg-[rgba(241,245,249,0.5)] text-center text-md break-words">
                  {activeReceiverAddress}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* Chat */}
        {address in chatAddresses && chatAddresses[address].length > 0 ? (
          <div className="flex flex-col overflow-y-auto">
            <div className="overflow-y-auto">
              <ChatBox
                messages={messages}
                setMessageLog={setMessageLog}
                receiverAddress={activeReceiverAddress}
              />
            </div>
            <MessageSender
              messages={messages}
              setMessageLog={setMessageLog}
              receiverAddress={activeReceiverAddress}
              messagesState={messagesState}
              setMessagesState={setMessagesState}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
