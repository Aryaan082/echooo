import React, { useCallback, useEffect, useRef, useState } from "react";
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
  GQL_QUERY_MESSAGE_LOG_INIT,
} from "../../constants";

import {
  logoutIconSVG,
  textBubbleSVG,
  dropdownIconSVG,
  echoooLogoSVG,
  errorIconSVG,
  changeKeysIconSVG,
  profileIconSVG,
} from "../../assets";
import "./receivers.css";
import moment from "moment";


const intervalGetMessages = async (
  address,
  newMessage,
  activeReceiverAddress,
  setMessageLog,
) => {
  const senderAddress = address.toLowerCase();
  console.log("receiever address >>>", activeReceiverAddress)
  console.log(
    "new message active interval >>>",
    newMessage[activeReceiverAddress]
  );


  let senderPrivateKey = JSON.parse(
    localStorage.getItem("private-communication-address")
  );
  senderPrivateKey = senderPrivateKey[address];

  const recentMessage = newMessage[activeReceiverAddress];
  console.log("recent message >>>", recentMessage)
  console.log("recent message >>>", recentMessage == null || recentMessage.length === 0)
  let recentTimestamp;
  if (recentMessage == null || recentMessage.length === 0) {
    return;
  } else {
    recentTimestamp = recentMessage.at(-1).timestamp
  }
  console.log("recentTimestamp >>>", recentTimestamp)
  const graphClient = await theGraphClient();
  const dataMessages = await graphClient
    .query(GQL_QUERY_MESSAGE_LOG_INTERVAL, {
      senderAddress: senderAddress,
      receiverAddress: activeReceiverAddress,
      recentMessageTimestamp: recentTimestamp
    })
    .toPromise();
    console.log("data messages interval >>>", dataMessages);
    console.log("data interval length >>>", Object.keys(dataMessages).length)
  const dataMessagesParsed = dataMessages.data.messages;
  console.log("data messages parsed interval >>>", dataMessagesParsed);
  const messageLog = dataMessagesParsed;
  if (Object.keys(messageLog).length === 0 || messageLog == null) {
    console.log("returning none >>>> ")
    return;
  }
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
};

export default function MessagingPage({
  toggleOpenModalChainSelect,
  toggleOpenCommAddressModal,
  toggleOpenNewChatModal,
  toggleOpenNFTOfferModal,
  toggleOpenSendModal,
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
  const [openP2P, setOpenP2P] = useState(false);
  const [messageInterval, setMessageInterval] = useState();
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  })

  const intervalCallback = useCallback((address,
    newMessage,
    activeReceiverAddress,
    setMessageLog) => {
    intervalGetMessages(address,
      newMessage,
      activeReceiverAddress,
      setMessageLog,);
  }, [activeReceiverAddress])

  const getMessagesAsyncCallback = useCallback(async () => {
    const senderAddress = address.toLowerCase();
    let senderPrivateKey = JSON.parse(
      localStorage.getItem("private-communication-address")
    );
    senderPrivateKey = senderPrivateKey[address];

    if (messages[activeReceiverAddress] == null) {
      const graphClient = theGraphClient();
      const dataIdentity = await graphClient
        .query(GQL_QUERY_IDENTITY_TIMESTAMP_RECENT, {
          senderAddress: senderAddress,
        })
        .toPromise();
      console.log("graph client >>>", graphClient);
      console.log("data identity >>>", dataIdentity);
      const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;

      const dataMessages = await graphClient
        .query(GQL_QUERY_MESSAGE_LOG_INIT, {
          senderAddress: senderAddress,
          receiverAddress: activeReceiverAddress,
          recentTimestamp: dataIdentityTimestamp,
        })
        .toPromise();
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

      setMessageLog(newMessageLog);
      return newMessageLog;
    }
  }, [activeReceiverAddress]);

  useEffect(() => {
    if (activeReceiverAddress === BURNER_ADDRESS) {
      return;
    }    
    if (activeReceiverAddress !== "") {
      if (messages[activeReceiverAddress] == null) {
        console.log("running active >>>")
        getMessagesAsyncCallback(); 
      } else {
        const interval = setInterval(
          async (
            senderAddress,
            newMessage,
            activeReceiverAddress,
            setMessageLog,
          ) =>
            intervalCallback(
              senderAddress,
              newMessage,
              activeReceiverAddress,
              setMessageLog              
            ),
          5 * 1000,
          address,
          messagesRef.current,
          activeReceiverAddress,
          setMessageLog,
        )
        return () => {
          console.log("clean up >>>");
          return clearInterval(interval)
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeReceiverAddress]);

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
              5. Edit profile
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
                    New chat
                    <img src={textBubbleSVG} alt=""></img>
                  </button>
                  <button className="flex justify-center items-center p-3 bg-white rounded-[30px]">
                    <img src={profileIconSVG} alt=""></img>
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          {/* Receiver Address */}
          {address in chatAddresses && chatAddresses[address].length > 0 ? (
            <div className="w-full" style={{ height: "calc(5vh - 100px}" }}>
              <div className="flex justify-center align-center">
                <div className="shadow-md flex flex-wrap rounded-[10px] border-[1px] p-5 bg-[rgba(255,255,255,0.45)] text-center text-md break-words">
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
          <div className="flex flex-col justify-end">
            <ChatBox
              messages={messages}
              setMessageLog={setMessageLog}
              receiverAddress={activeReceiverAddress}
              chatAddresses={chatAddresses}
              openP2P={openP2P}
            />
            <MessageSender
              messages={messages}
              setMessageLog={setMessageLog}
              receiverAddress={activeReceiverAddress}
              messagesState={messagesState}
              setMessagesState={setMessagesState}
              toggleOpenSendModal={toggleOpenSendModal}
              toggleOpenNFTOfferModal={toggleOpenNFTOfferModal}
              openP2P={openP2P}
              setOpenP2P={setOpenP2P}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
