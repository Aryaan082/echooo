import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import EthCrypto from "eth-crypto";
import { initGraphClient } from "../../config/theGraphClient";

import FriendsList from "./MessagingPageFriendsList";
import MessageSender from "./MessageSender";
import ChatBox from "./ChatBox";
import { CONTRACT_META_DATA } from "../../constants";
import {
  logoutIconSVG,
  textBubbleSVG,
  dropdownIconSVG,
  echoooLogoSVG,
  errorIconSVG,
  changeKeysIconSVG,
} from "../../assets";
import "./receivers.css";

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
    // TODO: cache messages
    // TODO: if messages already populates check if there's new messages, if so append state with new messages, else do not continue
    if (
      activeReceiverAddress === "0x0000000000000000000000000000000000000000"
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
        const identitiesTimestampQuery = `
          query {
            identities(
              where: {from: "${senderAddress}"}
              first: 1
              orderBy: timestamp
              orderDirection: desc
            ) {
              communicationAddress
              timestamp
            }
          }
        `;
        const graphClient = await initGraphClient();
        const dataIdentity = await graphClient
          .query(identitiesTimestampQuery)
          .toPromise();
        const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;
        const dataIdentityCommAddress =
          dataIdentity.data.identities[0].communicationAddress; // TODO: Use this to check that this address matches our comm address

        const messagesQuery = `
          query {
            messages(            
              orderBy: timestamp
              orderDirection: asc
              where: {
                from_in: ["${senderAddress}", "${activeReceiverAddress}"],
                receiver_in: ["${senderAddress}", "${activeReceiverAddress}"]
                timestamp_gte: "${dataIdentityTimestamp}"
              }
          
            ) {
              from
              senderMessage
              receiverMessage
              timestamp
            }
          }
        `;
        const dataMessages = await graphClient.query(messagesQuery).toPromise();
        const dataMessagesParsed = dataMessages.data.messages;
        console.log("data messages parsed init query >>>", dataMessagesParsed);
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
        const interval = setInterval(async (newMessage, activeReceiverAddress) => {
          console.log("new message active interval >>>", newMessage[activeReceiverAddress])
          if (Object.keys(newMessage).length === 0 || newMessage == null) {
            return
          }
          const mostRecentMessageMeta = newMessage[activeReceiverAddress].at(-1);
          console.log("most recent message meta interval >>>", mostRecentMessageMeta)
          const messagesQuery = `

          query {
            messages(            
              orderBy: timestamp
              orderDirection: asc
              where: {
                from_in: ["${senderAddress}", "${activeReceiverAddress}"],
                receiver_in: ["${senderAddress}", "${activeReceiverAddress}"]
                timestamp_gt: "${mostRecentMessageMeta.timestamp}"
              }
          
            ) {
              from
              senderMessage
              receiverMessage
              timestamp
            }
          }
        `;

          const graphClient = await initGraphClient();
          const dataMessages = await graphClient.query(messagesQuery).toPromise();
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
          },
          5 * 1000,
          newMessageLog,
          activeReceiverAddress
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
