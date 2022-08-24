import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import EthCrypto from "eth-crypto";
import moment from "moment";

import FriendsList from "./MessagingPageFriendsList";
import MessageSender from "./MessageSender";
import ChatBox from "./ChatBox";

import { useTheGraphClient } from "../../config";
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
import { ContractInstance } from "../../hooks";
import "./receivers.css";

const intervalFetchMessages = async (
  address,
  newMessage,
  activeReceiverAddress,
  setMessageLog,
  graphClient
) => {
  const senderAddress = address.toLowerCase();

  let senderPrivateKey = JSON.parse(
    localStorage.getItem("private-communication-address")
  );
  senderPrivateKey = senderPrivateKey[address];

  const recentMessage = newMessage[activeReceiverAddress];

  let recentTimestamp;
  if (recentMessage == null || recentMessage.length === 0) {
    return;
  } else {
    recentTimestamp = recentMessage.at(-1).timestamp;
  }

  const dataMessages = await graphClient
    .query(GQL_QUERY_MESSAGE_LOG_INTERVAL, {
      senderAddress: senderAddress,
      receiverAddress: activeReceiverAddress,
      recentMessageTimestamp: recentTimestamp,
    })
    .toPromise();
  // console.log("data messages interval >>>", dataMessages);
  // console.log("data interval length >>>", Object.keys(dataMessages).length);
  const dataMessagesParsed = dataMessages.data.messages;
  const messageLog = dataMessagesParsed;
  if (Object.keys(messageLog).length === 0 || messageLog == null) {
    return;
  }
  for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
    let metaDataMessages = await dataMessagesParsed[idx];
    let message = "";

    // check that encrypted message is correct ex: someone could send an empty string that would grief the chat
    if (
      metaDataMessages.senderMessage.length < 194 ||
      metaDataMessages.receiverMessage.length < 194
    ) {
      continue;
    }

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
    ).catch((err) => {
      console.log("Sending Message Error:", err);
      // TODO: make message indicative of error by changing color
      let errorMessage = "Error: Encryption error. Change communication keys";
      return errorMessage;
    });
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
  toggleOpenProfileModal,
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
  messages,
  setMessageLog,
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { chains } = useSwitchNetwork();

  const [unknownChatAddresses, setUnknownChatAddresses] = useState({});
  const [openP2P, setOpenP2P] = useState(false);
  const [showTrustedAddressList, setShowTrustedAddressList] = useState(true);
  const [profilePicture, setProfilePicture] = useState("");

  const messagesRef = useRef(messages);

  const contracts = ContractInstance();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const graphClient = chain.id in CONTRACT_META_DATA ? useTheGraphClient() : "";

  useEffect(() => {
    messagesRef.current = messages;
    async function placeholder() {
      setProfilePicture(await getPFP(address));
    }
    placeholder();
  });

  const getPFP = async (userAddress) => {
    return await contracts.contractPFP.getProfilePicture(userAddress);
  };

  const intervalCallback = useCallback(
    (
      address,
      newMessage,
      activeReceiverAddress,
      setMessageLog,
      graphClient
    ) => {
      intervalFetchMessages(
        address,
        newMessage,
        activeReceiverAddress,
        setMessageLog,
        graphClient
      );
    },
    [activeReceiverAddress]
  );

  const fetchMessagesAsyncCallback = useCallback(async () => {
    const senderAddress = address.toLowerCase();
    let senderPrivateKey = JSON.parse(
      localStorage.getItem("private-communication-address")
    );
    senderPrivateKey = senderPrivateKey[address];

    if (
      activeReceiverAddress != null &&
      messages[activeReceiverAddress] == null
    ) {
      const dataIdentity = await graphClient
        .query(GQL_QUERY_IDENTITY_TIMESTAMP_RECENT, {
          senderAddress: senderAddress,
        })
        .toPromise();
      // console.log("graph client >>>", graphClient);
      // console.log("data identity >>>", dataIdentity);
      const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;

      const dataMessages = await graphClient
        .query(GQL_QUERY_MESSAGE_LOG_INIT, {
          senderAddress: senderAddress,
          receiverAddress: activeReceiverAddress,
          recentTimestamp: dataIdentityTimestamp,
        })
        .toPromise();

      console.log("data messages >>>", dataMessages);
      const dataMessagesParsed = dataMessages.data.messages;

      const messageLog = dataMessagesParsed;
      const newMessageState = {
        ...messagesState,
        [activeReceiverAddress]: false,
      };
      for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
        let metaDataMessages = await dataMessagesParsed[idx];

        // check that encrypted message is correct ex: someone could send an empty string that would grief the chat
        if (
          metaDataMessages.senderMessage.length < 194 ||
          metaDataMessages.receiverMessage.length < 194
        ) {
          continue;
        }
        let messageEncrypted = "";

        // Decrypt sender message
        if (metaDataMessages.from === senderAddress) {
          messageEncrypted = metaDataMessages.senderMessage;
        } else {
          // Decrypt receiver message
          messageEncrypted = metaDataMessages.receiverMessage;
        }

        let decryptedMessage = await EthCrypto.decryptWithPrivateKey(
          senderPrivateKey,
          EthCrypto.cipher.parse(messageEncrypted)
        ).catch((err) => {
          console.log("Sending Message Error:", err);
          // TODO: make message indicative of error by changing color
          let errorMessage =
            "Error: Encryption error. Change communication keys";
          let newReceiverMessageLog = [
            {
              from: address,
              message: errorMessage,
              timestamp: `${moment().unix()}`,
            },
          ];

          if (
            Object.keys(messages).length !== 0 ||
            activeReceiverAddress in messages
          ) {
            newReceiverMessageLog = [
              ...messages[activeReceiverAddress],
              ...newReceiverMessageLog,
            ];
          } else {
            newReceiverMessageLog = [newReceiverMessageLog];
          }

          const newMessageLog = messages;
          newMessageLog[activeReceiverAddress] = newReceiverMessageLog;
          setMessageLog(newMessageLog);
          const result = {
            message: errorMessage,
          };
          return result;
        });

        if (metaDataMessages.messageType === "1") {
          decryptedMessage = JSON.parse(decryptedMessage);
        }

        messageLog[idx].message = decryptedMessage;
        messageLog[idx].messageType = metaDataMessages.messageType;
      }

      const newMessageLog = {
        ...messages,
        [activeReceiverAddress]: messageLog,
      };
      console.log("new message log >>>", newMessageLog);
      setMessageLog(newMessageLog);
      return newMessageLog;
    }
    // Do nothing is conditions are not met
    return;
  }, [activeReceiverAddress]);

  useEffect(() => {
    if (activeReceiverAddress === BURNER_ADDRESS) {
      return;
    }
    if (activeReceiverAddress !== "") {
      if (messages[activeReceiverAddress] == null) {
        // console.log("running active >>>");
        fetchMessagesAsyncCallback();
      } else {
        const interval = setInterval(
          async (
            senderAddress,
            newMessage,
            activeReceiverAddress,
            setMessageLog,
            graphClient
          ) =>
            intervalCallback(
              senderAddress,
              newMessage,
              activeReceiverAddress,
              setMessageLog,
              graphClient
            ),
          5 * 1000,
          address,
          messagesRef.current,
          activeReceiverAddress,
          setMessageLog,
          graphClient
        );
        return () => {
          // console.log("clean up >>>");
          return clearInterval(interval);
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
        unknownChatAddresses={unknownChatAddresses}
        setUnknownChatAddresses={setUnknownChatAddresses}
        showTrustedAddressList={showTrustedAddressList}
        setShowTrustedAddressList={setShowTrustedAddressList}
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
                      className="w-[30px]"
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
                  <button
                    className="flex justify-center items-center w-[54px] bg-white rounded-[30px]"
                    onClick={() => {
                      toggleOpenProfileModal();
                    }}
                  >
                    {Boolean(profilePicture) ? (
                      <img
                        className="rounded-[30px] h-[54px]"
                        src={profilePicture}
                        alt=""
                      ></img>
                    ) : (
                      <img src={profileIconSVG} alt=""></img>
                    )}
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          {/* Receiver Address */}
          {(address in chatAddresses && chatAddresses[address].length > 0) ||
          (address in unknownChatAddresses &&
            unknownChatAddresses[address].length > 0) ? (
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
        {(address in chatAddresses && chatAddresses[address].length > 0) ||
        (address in unknownChatAddresses &&
          unknownChatAddresses[address].length > 0) ? (
          <div className="relative flex flex-col justify-end">
            <ChatBox
              messages={messages}
              activeReceiverAddress={activeReceiverAddress}
            />
            <MessageSender
              messages={messages}
              setMessageLog={setMessageLog}
              activeReceiverAddress={activeReceiverAddress}
              messagesState={messagesState}
              setMessagesState={setMessagesState}
              toggleOpenSendModal={toggleOpenSendModal}
              toggleOpenNFTOfferModal={toggleOpenNFTOfferModal}
              openP2P={openP2P}
              setOpenP2P={setOpenP2P}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
