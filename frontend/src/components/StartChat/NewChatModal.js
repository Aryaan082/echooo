import Modal from "react-modal";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import "./chat.css";
import { continueIconSVG } from "../../assets";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    border: "0px",
    borderRadius: "1.5rem",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
};

export default function NewChatModal({
  openModal,
  toggleOpenModal,
  newChatAddress,
  setNewChatAddress,
  chatAddresses,
  setChatAddresses,
  setActiveReceiver,
  setActiveIndex,
}) {
  const { address } = useAccount();

  const handleChatInputChange = (e) => setNewChatAddress(e.target.value);

  const handleStartChat = (e, chatAddresses, newChatAddress, address) => {
    toggleOpenModal();
    setChatAddresses((current) => {
      const chatAddressesTemp = Object.assign({}, current);
      if (Object.keys(chatAddresses).length !== 0 && address in chatAddresses) {
        chatAddressesTemp[address] = [
          ...chatAddresses[address],
          newChatAddress,
        ];
      } else {
        chatAddressesTemp[address] = [newChatAddress];
      }
      return chatAddressesTemp;
    });

    setActiveReceiver(newChatAddress);
    setActiveIndex(chatAddresses[address].length);
    setNewChatAddress("");
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={toggleOpenModal}
      style={modalStyles}
    >
      <div className="flex flex-col py-4 px-4 gap-4">
        <code className="text-2xl">Start a new anon chat.</code>
        <div className="flex flex-row gap-3">
          <input
            placeholder="Type address or ENS"
            onChange={handleChatInputChange}
            className="code w-[450px] px-4 py-3 rounded-[8px] bg-[#f2f2f2]"
          ></input>
          <button
            className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] hover:bg-[#555555] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) =>
              handleStartChat(e, chatAddresses, newChatAddress, address)
            }
            disabled={
              newChatAddress.length !== 42 ||
              (address in chatAddresses &&
                chatAddresses[address].includes(newChatAddress)) ||
              address === newChatAddress
            }
          >
            Start
            <img src={continueIconSVG}></img>
          </button>
        </div>
        {address === newChatAddress ||
        (address in chatAddresses &&
          chatAddresses[address].includes(newChatAddress)) ? (
          <div className="text-lg text-red-500 text-center">
            Invalid address or chatter already exists.
          </div>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
}
