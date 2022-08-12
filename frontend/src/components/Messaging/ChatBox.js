import { useAccount } from "wagmi";

import SendMessageContainer from "./SendMessageContainer";
import ReceiveMessageContainer from "./ReceiveMessageContainer";

const renderChat = (receiverAddress, messages) => {
  const chatJSX = [];
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

const ChatBox = ({ receiverAddress, messages, openP2P }) => {
  const { address } = useAccount();

  const chat = renderChat(receiverAddress, messages);

  return <div className="h-[72vh] overflow-y-scroll">{chat}</div>;
};

export default ChatBox;
