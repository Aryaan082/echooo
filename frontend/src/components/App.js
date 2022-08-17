import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

import WalletModal from "./Wallet/WalletModal";
import ChainSelectorModal from "./Chain/ChainSelectorModal";
import NewChatModal from "./StartChat/NewChatModal";
import MessagingPage from "./Messaging/MessagingPage";
import CommAddressModal from "./ChangeKeys/CommAddressModal";
import NFTOfferModal from "./Messaging/PeerToPeer/NFTOfferModal";
import TokenTransfer from "./Messaging/PeerToPeer/TokenTransfer";

import { BURNER_ADDRESS } from "../constants";
import { gradientOneSVG, gradientTwoSVG, echoooLogoSVG } from "../assets/";

export default function App() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();
  const { address } = useAccount();

  const [connectedWallet, setConnectedWallet] = useState(false);
  const [chainSelect, setChainSelect] = useState(false);
  const [openModalConnect, setOpenModalConnect] = useState(false);
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [newChatAddress, setNewChatAddress] = useState("");
  const [activeReceiverAddress, setActiveReceiver] = useState(BURNER_ADDRESS);
  const [broadcasting, setBroadcasting] = useState(false);
  const [messagesState, setMessagesState] = useState({});
  const [chatAddresses, setChatAddresses] = useState(
    JSON.parse(localStorage.getItem("chats")) || {}
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [communicationAddress, setCommunicationAddress] = useState(
    Boolean(JSON.parse(localStorage.getItem("public-communication-address"))) &&
      address in
        JSON.parse(localStorage.getItem("public-communication-address"))
      ? JSON.parse(localStorage.getItem("public-communication-address"))[
          address
        ]
      : ""
  );
  const [openCommAddressModal, setOpenCommAddressModal] = useState(
    !(
      Boolean(
        JSON.parse(localStorage.getItem("public-communication-address"))
      ) &&
      address in
        JSON.parse(localStorage.getItem("public-communication-address"))
    ) || ""
  );
  const [openSend, setOpenSend] = useState(false);
  const [openNFTOfferModal, setOpenNFTOfferModal] = useState(false);

  const toggleOpenModalConnect = () => setOpenModalConnect(!openModalConnect);
  const toggleOpenModalChainSelect = () => setChainSelect(!chainSelect);
  const toggleOpenNewChatModal = () => setOpenNewChatModal(!openNewChatModal);
  const toggleOpenCommAddressModal = () =>
    setOpenCommAddressModal(!openCommAddressModal);
  const toggleOpenSendModal = () => setOpenSend(!openSend);
  const toggleOpenNFTOfferModal = () =>
    setOpenNFTOfferModal(!openNFTOfferModal);

  useAccount({
    onDisconnect() {
      setConnectedWallet(false);
    },
  });

  useAccount({
    onConnect() {
      setConnectedWallet(true);
      setOpenModalConnect(false);
      setActiveReceiver(JSON.parse(localStorage.getItem("chats"))[address][0] || "");
      setChatAddresses(JSON.parse(localStorage.getItem("chats"))|| []);
    },
  });

  // successfully switched network
  useSwitchNetwork({
    onSuccess() {},
  });

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chatAddresses));
  }, [chatAddresses]);

  return (
    <div
      style={{
        backgroundImage: `url(${
          !connectedWallet ? gradientOneSVG : gradientTwoSVG
        })`,
        backgroundSize: "cover",
      }}
    >
      <WalletModal
        openModal={openModalConnect}
        toggleOpenModal={toggleOpenModalConnect}
      />
      {!connectedWallet ? (
        <div className="flex justify-center items-center h-[100vh]">
          <div className="flex justify-center h-[290px] w-[630px] rounded-2xl bg-white">
            <div className="flex flex-col justify-center items-center gap-7">
              <img className="w-[170px]" src={echoooLogoSVG}></img>
              <code>Connect your wallet to start chatting, anon.</code>
              <button
                className="px-5 py-3 bg-gradient-to-r from-[#00FFD1] to-[#FF007A] via-[#9b649c] text-white font-bold rounded-[30px]"
                onClick={toggleOpenModalConnect}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <ChainSelectorModal
            openModal={chainSelect}
            toggleOpenModal={toggleOpenModalChainSelect}
          />
          <CommAddressModal
            openModal={openCommAddressModal}
            toggleOpenModal={toggleOpenCommAddressModal}
            setCommunicationAddress={setCommunicationAddress}
            broadcasting={broadcasting}
            setBroadcasting={setBroadcasting}
          />
          <NewChatModal
            openModal={openNewChatModal}
            toggleOpenModal={toggleOpenNewChatModal}
            toggleOpenNewChatModal={toggleOpenNewChatModal}
            newChatAddress={newChatAddress}
            setNewChatAddress={setNewChatAddress}
            chatAddresses={chatAddresses}
            setChatAddresses={setChatAddresses}
            setActiveReceiver={setActiveReceiver}
            setActiveIndex={setActiveIndex}
          />
          <TokenTransfer
            openModal={openSend}
            toggleOpenModal={toggleOpenSendModal}
            activeReceiverAddress={activeReceiverAddress}
          />
          <NFTOfferModal
            openModal={openNFTOfferModal}
            toggleOpenModal={toggleOpenNFTOfferModal}
            activeReceiverAddress={activeReceiverAddress}
          />
          <MessagingPage
            toggleOpenModalChainSelect={toggleOpenModalChainSelect}
            toggleOpenCommAddressModal={toggleOpenCommAddressModal}
            toggleOpenNewChatModal={toggleOpenNewChatModal}
            toggleOpenSendModal={toggleOpenSendModal}
            toggleOpenNFTOfferModal={toggleOpenNFTOfferModal}
            chatAddresses={chatAddresses}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            activeReceiverAddress={activeReceiverAddress}
            setActiveReceiver={setActiveReceiver}
            communicationAddress={communicationAddress}
            setChatAddresses={setChatAddresses}
            messagesState={messagesState}
            setMessagesState={setMessagesState}
          />
        </div>
      )}
    </div>
  );
}
