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

const ChatBox = ({
  receiverAddress,
  messages,
  setMessageLog,
  chatAddresses,
}) => {
  const { address } = useAccount();

  const chat = renderChat(receiverAddress, messages);

  return (
    <div className="flex flex-col h-[78vh] justify-start">
      {/* Receiver Address */}
      {address in chatAddresses && chatAddresses[address].length > 0 ? (
        <div className="w-full" style={{ height: "calc(5vh - 100px}" }}>
          <div className="flex justify-center align-center">
            <div className="shadow-md flex flex-wrap rounded-[10px] border-[1px] p-5 bg-[rgba(255,255,255,0.45)] text-center text-md break-words">
              {receiverAddress}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {chat}
    </div>
  );
};

export default ChatBox;
