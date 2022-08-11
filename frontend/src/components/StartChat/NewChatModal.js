import Modal from "react-modal";
import React from "react";
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

  React.useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chatAddresses));
  }, [chatAddresses]);

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
            className="flex flex-row justify-center text-lg items-center gap-[15px] px-5 py-3 bg-[#555555] text-white font-bold rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={
              // communication is setup when at least 1 chat is open
              Object.keys(chatAddresses).length !== 0 &&
              address in chatAddresses
                ? () => {
                    toggleOpenModal();
                    console.log("HI1");
                    setChatAddresses((current) => {
                      let chatAddressesTemp = Object.assign({}, current);
                      console.log(chatAddressesTemp);
                      chatAddressesTemp[address] = [
                        ...chatAddresses[address],
                        newChatAddress,
                      ];
                      console.log(chatAddressesTemp);
                      return chatAddressesTemp;
                    });
                    setActiveReceiver(newChatAddress);
                    setActiveIndex(chatAddresses[address].length);
                    setNewChatAddress("");
                  }
                : () => {
                    toggleOpenModal();
                    setChatAddresses((current) => {
                      let chatAddressesTemp = Object.assign({}, current);
                      console.log(chatAddressesTemp);
                      chatAddressesTemp[address] = [newChatAddress];
                      console.log(chatAddressesTemp);
                      return chatAddressesTemp;
                    });
                    setActiveReceiver(newChatAddress);
                    setActiveIndex(chatAddresses[address].length);
                    setNewChatAddress("");
                  }
            }
            disabled={
              newChatAddress.length !== 42 ||
              (address in chatAddresses &&
                chatAddresses[address].includes(newChatAddress))
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
