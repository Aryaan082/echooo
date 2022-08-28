import Modal from "react-modal";
import React from "react";
import EthCrypto from "eth-crypto";
import { useAccount } from "wagmi";
import { Oval } from "react-loader-spinner";

import { ContractInstance } from "../../hooks";

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

const createCommunicationAddress = async (contractEcho, address) => {
  const ethWallet = EthCrypto.createIdentity();
  const publicKey = ethWallet.publicKey;
  const privateKey = ethWallet.privateKey;
  const tx = await contractEcho.logIdentity(publicKey);
  await tx.wait();

  let localPublicKeys = JSON.parse(
    localStorage.getItem("public-communication-address")
  );
  let localPrivateKeys = JSON.parse(
    localStorage.getItem("private-communication-address")
  );

  if (localPublicKeys === null || localPrivateKeys === null) {
    localPublicKeys = {};
    localPrivateKeys = {};
  }

  const newLocalPublicKeys = Object.assign({}, localPublicKeys, {
    [address]: publicKey,
  });
  const newLocalPrivateKeys = Object.assign({}, localPrivateKeys, {
    [address]: privateKey,
  });

  localStorage.setItem(
    "public-communication-address",
    JSON.stringify(newLocalPublicKeys)
  );

  localStorage.setItem(
    "private-communication-address",
    JSON.stringify(newLocalPrivateKeys)
  );
  return;
};

export default function CommAddressModal({
  openModal,
  toggleOpenModal,
  toggleKeysSetup,
  setCommunicationAddress,
  broadcasting,
  setBroadcasting,
}) {
  const { address } = useAccount();

  const contracts = ContractInstance();

  const handleSetCommunicationAddress = (e) => {
    setBroadcasting(true);
    createCommunicationAddress(contracts.contractEcho, address)
      .then(() => {
        const localPublicKeys = JSON.parse(
          localStorage.getItem("public-communication-address")
        );
        const signerPublicKey = localPublicKeys[address];
        setCommunicationAddress(signerPublicKey);
        setBroadcasting(false);
        toggleOpenModal();
        toggleKeysSetup();
      })
      .catch(() => {
        setBroadcasting(false);
      });
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={toggleOpenModal}
      style={modalStyles}
    >
      {broadcasting ? (
        <div className="flex flex-col w-[384px] items-center justify-center gap-[20px]">
          <Oval
            ariaLabel="loading-indicator"
            height={40}
            width={40}
            strokeWidth={3}
            strokeWidthSecondary={3}
            color="black"
            secondaryColor="white"
          />
          <div className="text-xl font-medium">Broadcasting...</div>
          <div className="text-xl font-medium">Do Not Leave the Page</div>
        </div>
      ) : (
        <div className="flex flex-col py-4 px-4 gap-6">
          <code className="text-2xl font-bold text-left">
            Create a new communication address.
          </code>
          <code className="text-md text-gray-500 w-[450px]">
            Get your new communication public and private keys to keep your
            messages safe.
          </code>
          <div className="flex flex-col gap-2">
            <button
              className="w-full flex text-lg justify-center items-center px-5 py-3 bg-[rgb(44,156,218)] via-[#9b649c] text-white font-bold rounded-[8px]"
              onClick={handleSetCommunicationAddress}
            >
              <code>Get your keys</code>
            </button>
            <button
              className="w-full flex text-lg justify-center items-center bg-white-500 text-[rgb(46,128,236)] font-bold px-5 py-3"
              onClick={toggleOpenModal}
            >
              <code>Not now</code>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
