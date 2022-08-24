import { useAccount } from "wagmi";

import SendMessageContainer from "./SendMessageContainer";
import ReceiveMessageContainer from "./ReceiveMessageContainer";

const renderChat = (receiverAddress, messages) => {
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
    let metadata = messageMetaData.metadata;
    console.log("message meta data", messageMetaData)
    if (receiverAddressLowerCase === messageMetaData.from) {
      if (messageMetaData.messageType === "1") {
        message = (
          <div>
            <h2>
              NFT Offer
            </h2>
            <h3>From</h3>
            <code>{metadata.buyer}</code>
            <div className="flex-row">
              <div>
                <h3>Price</h3>
                <code>{metadata.tokenAmount}</code>
              </div>
              <div>
                <h3>Expires</h3>
                <code>{metadata.timeExpiry}</code>
              </div>
              <div>

              </div>
              <button>
                Cancel Offer
              </button>
            </div>            
          </div>
        )
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
      if (messageMetaData.messageType === "1") {
      
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
  const chat = renderChat(activeReceiverAddress, messages);

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
