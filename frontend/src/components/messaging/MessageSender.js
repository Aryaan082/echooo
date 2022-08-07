import React, { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import EthCrypto from "eth-crypto";
import { initGraphClient } from "../../config/theGraphClient";
import { Oval } from "react-loader-spinner";
import moment from "moment";

import { ContractInstance } from "../../hooks";
import { plusIconSVG, sendMessagesIconSVG } from "../../assets";
import "./receivers.css";

const MessageSender = ({
  receiverAddress,
  messages,
  setMessageLog,
  messagesState,
  setMessagesState,
}) => {
  const [senderMessage, setSenderMessage] = useState("");
  const { address } = useAccount();
  const echoContract = ContractInstance();
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    setMessagesState({ [receiverAddress]: true });

    let senderPublicKey = JSON.parse(
      localStorage.getItem("public-communication-address")
    );
    senderPublicKey = senderPublicKey[address];

    // TODO: break up into smaller functions
    const sendMessage = async (receiverAddress) => {
      // TODO: sanitize graphQL queries b/c currently dynamic and exposes injection vulnerability
      // TODO: error if receiver did not emit public key

      // Query receiver address
      const identitiesQuery = `
        query {
          identities(where: {from: "${receiverAddress}"}, first: 1, orderBy: timestamp, orderDirection: desc) {
            communicationAddress,
            timestamp     
          }
        }
      `;
      const graphClient = await initGraphClient();
      const data = await graphClient.query(identitiesQuery).toPromise();
      console.log(data);
      const receiverPublicKey = data.data.identities[0].communicationAddress;

      // Encrypt message with sender and receiver public keys so messages can be read from graph by both
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

      const tx = await echoContract.logMessage(
        receiverAddress,
        messageEncryptedSender,
        messageEncryptedReceiver
      );
      await tx.wait();
    };

    const newMessageState = { ...messagesState, [receiverAddress]: false };
    console.log("New" + newMessageState);
    sendMessage(receiverAddress)
      .then(() => {
        const newReceiverMessageLog = [
          ...messages[receiverAddress],
          {
            from: address,
            message: senderMessage,
            timestamp: `${moment().unix()}`,
          },
        ];

        const newMessageLog = messages;
        newMessageLog[receiverAddress] = newReceiverMessageLog;
        setMessageLog(newMessageLog);
        setMessagesState(newMessageState);
      })
      .catch((err) => {
        console.log("Sending Message Error:", err);
        // TODO: make message indicative of error by changing color
        const newReceiverMessageLog = [
          ...messages[receiverAddress],
          {
            from: address,
            message: "Error: Message failed please try again ...",
            timestamp: `${moment().unix()}`,
          },
        ];

        const newMessageLog = messages;
        newMessageLog[receiverAddress] = newReceiverMessageLog;
        setMessageLog(newMessageLog);
        setMessagesState(newMessageState);
      });
    setSenderMessage("");
  };

  return (
    <>
      <form
        onSubmit={handleSubmitMessage}
        className="flex flex-row align-center justify-center w-full gap-2 px-4 py-4"
      >
        <input
          onChange={(event) => setSenderMessage(event.target.value)}
          value={senderMessage}
          id="sender_message"
          className="drop-shadow-md bg-gray-50 rounded-[30px] text-gray-900 text-md w-full p-4"
          placeholder="Type your message..."
          required
        />
        <button
          className="flex flex-row justify-center items-center gap-[10px] text-white text-lg bg-[#333333] rounded-[30px] hover:bg-[#555555] font-medium px-[13.1px] disabled:opacity-25"
          disabled={true}
        >
          <img height="35" width="35" src={plusIconSVG}></img>
        </button>
        {messagesState[receiverAddress] ? (
          <div className="flex flex-row w-[384px] items-center justify-center gap-[20px]">
            <Oval
              ariaLabel="loading-indicator"
              height={40}
              width={40}
              strokeWidth={3}
              strokeWidthSecondary={3}
              color="black"
              secondaryColor="white"
            />
            <div className="text-xl font-medium">Sending message...</div>
          </div>
        ) : (
          <button
            type="submit"
            className="flex flex-row justify-center items-center gap-[10px] text-white text-lg bg-[#333333] rounded-[30px] hover:bg-[#555555] font-medium px-6"
          >
            Send
            <img className="h-[25px]" src={sendMessagesIconSVG}></img>
          </button>
        )}
      </form>
    </>
  );
};

export default MessageSender;
