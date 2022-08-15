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

  if (receiverAddress in messages) {
    messages[receiverAddress].reverse();
  }

  return (
    <div className="absolute flex flex-col-reverse overflow-y-scroll w-full bottom-[88px] h-[72vh]">
      {chat}
    </div>
  );
};

export default ChatBox;
