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
    if (receiverAddressLowerCase === messageMetaData.from) {
      chatJSX.push(
        <ReceiveMessageContainer
          receiverAddress={receiverAddressLowerCase}
          message={messageMetaData.message}
          timestamp={messageMetaData.timestamp}
          key={idx}
        />
      );
    } else {
      chatJSX.push(
        <SendMessageContainer
          message={messageMetaData.message}
          timestamp={messageMetaData.timestamp}
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
