import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import EthCrypto from "eth-crypto";
import { useTheGraphClient } from "../../config";
import { Oval } from "react-loader-spinner";
import moment from "moment";

import {
  GQL_QUERY_GET_COMMUNICATION_ADDRESS,
  CONTRACT_META_DATA,
} from "../../constants";
import { ContractInstance } from "../../hooks";
import {
  plusIconSVG,
  sendMessagesIconSVG,
  exchangeIconSVG,
  lendingIconSVG,
  minusIconSVG,
  transferTokenIconSVG,
} from "../../assets";
import "./receivers.css";

const MessageSender = ({
  activeReceiverAddress,
  messages,
  setMessageLog,
  messagesState,
  setMessagesState,
  toggleOpenSendModal,
  toggleOpenNFTOfferModal,
  openP2P,
  setOpenP2P,
}) => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const graphClient = chain.id in CONTRACT_META_DATA ? useTheGraphClient() : "";
  const [senderMessage, setSenderMessage] = useState("");

  const toggleOpenP2P = () => setOpenP2P(!openP2P);

  const contracts = ContractInstance();

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    setMessagesState({ [activeReceiverAddress]: true });

    let senderPublicKey = JSON.parse(
      localStorage.getItem("public-communication-address")
    );
    senderPublicKey = senderPublicKey[address];

    // TODO: break up into smaller functions
    const sendMessage = async (activeReceiverAddress) => {
      // TODO: sanitize graphQL queries b/c currently dynamic and exposes injection vulnerability

      // Query for the receiver's communication public key
      const data = await graphClient
        .query(GQL_QUERY_GET_COMMUNICATION_ADDRESS, {
          receiverAddress: activeReceiverAddress,
        })
        .toPromise();

      const receiverPublicKey = data.data.identities[0].communicationAddress;

      let messageEncryptedSender = await EthCrypto.encryptWithPublicKey(
        senderPublicKey,
        senderMessage
      );
      let messageEncryptedReceiver = await EthCrypto.encryptWithPublicKey(
        receiverPublicKey,
        senderMessage
      );
      messageEncryptedSender = EthCrypto.cipher.stringify(
        messageEncryptedSender
      );
      messageEncryptedReceiver = EthCrypto.cipher.stringify(
        messageEncryptedReceiver
      );

      const tx = await contracts.contractEcho.logMessage(
        0,
        activeReceiverAddress,
        messageEncryptedSender,
        messageEncryptedReceiver
      );
      await tx.wait();
    };

    const newMessageState = {
      ...messagesState,
      [activeReceiverAddress]: false,
    };

    // Sends transaction to blockchain
    sendMessage(activeReceiverAddress, messages)
      .then(() => {
        let newReceiverMessageLog;

        if (
          Object.keys(messages).length !== 0 ||
          activeReceiverAddress in messages
        ) {
          newReceiverMessageLog = [
            ...messages[activeReceiverAddress],
            {
              from: address,
              message: senderMessage,
              timestamp: `${moment().unix()}`,
            },
          ];
        } else {
          newReceiverMessageLog = [
            {
              from: address,
              message: senderMessage,
              timestamp: `${moment().unix()}`,
            },
          ];
        }

        const newMessageLog = messages;
        newMessageLog[activeReceiverAddress] = newReceiverMessageLog;
        setMessageLog(newMessageLog);
        setMessagesState(newMessageState);
      })
      .catch((err) => {
        console.log("Sending Message Error:", err);
        // TODO: make message indicative of error by changing color

        let newReceiverMessageLog = [
          {
            from: address,
            message:
              "Error: Address likely doesn't have a communication address",
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
        setMessagesState(newMessageState);
      });

    setSenderMessage("");
  };

  return (
    <div className="flex flex-row items-end gap-3 p-4 bg-white">
      <input
        onChange={(event) => setSenderMessage(event.target.value)}
        value={senderMessage}
        id="sender_message"
        className="drop-shadow-md bg-gray-50 rounded-[30px] text-gray-900 text-md w-full p-4"
        placeholder="Type your message..."
        required
      />
      <div className="flex flex-col items-end relative">
        {openP2P ? (
          <div className="absolute flex flex-col bottom-[70px] w-[240px] rounded-[10px] border border-[#eeeeee] bg-white">
            <button
              className="flex flex-row items-center gap-2 p-3 rounded-t-[10px] hover:bg-[#eeeeee]"
              onClick={() => {
                toggleOpenSendModal();
                toggleOpenP2P();
              }}
            >
              <img className="h-[25px]" src={transferTokenIconSVG} alt=""></img>
              <code>Send tokens</code>
            </button>
            <button
              className="flex flex-row items-center gap-2 p-3 hover:bg-[#eeeeee]"
              onClick={() => {
                toggleOpenNFTOfferModal();
                toggleOpenP2P();
              }}
            >
              <img src={exchangeIconSVG} alt=""></img>
              <code>Make NFT offer</code>
            </button>
            <button className="flex flex-row items-center gap-2 p-3 rounded-b-[10px] hover:bg-[#eeeeee]">
              <img className="h-[25px]" src={lendingIconSVG} alt=""></img>
              <code>Make lending offer</code>
            </button>
          </div>
        ) : (
          <></>
        )}
        <button
          className="flex flex-row justify-center items-center bg-[#333333] rounded-[50px] hover:bg-[#999999] w-[56px] h-[56px]"
          onClick={() => toggleOpenP2P()}
        >
          <img
            height="30"
            width="30"
            src={openP2P ? minusIconSVG : plusIconSVG}
            alt=""
          ></img>
        </button>
      </div>
      {messagesState[activeReceiverAddress] ? (
        <div className="flex flex-row items-center justify-center gap-[20px]">
          <Oval
            ariaLabel="loading-indicator"
            height={40}
            width={40}
            strokeWidth={3}
            strokeWidthSecondary={3}
            color="black"
            secondaryColor="white"
          />
          <div className="text-xl font-medium">Sending...</div>
        </div>
      ) : (
        <button
          className="flex flex-row justify-center items-center gap-[10px] text-white text-lg bg-[#333333] rounded-[30px] hover:bg-[#555555] font-medium h-[56px] px-6 disabled:opacity-25"
          onClick={handleSubmitMessage}
          disabled={!Boolean(senderMessage)}
        >
          Send
          <img className="h-[25px]" src={sendMessagesIconSVG}></img>
        </button>
      )}
    </div>
  );
};

export default MessageSender;
