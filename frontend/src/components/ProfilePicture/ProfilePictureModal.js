import Modal from "react-modal";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import Moralis from "moralis";
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

export default function ProfilePictureModal({ openModal, toggleOpenModal }) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [NFTsOwned, setNFTsOwned] = useState([]);
  const [NFTTokenIndex, setNFTTokenIndex] = useState();
  const [NFTTokenURI, setNFTTokenURI] = useState("");
  const [isLoading, setLoading] = useState(false);
  // TODO: add to constants
  const IPFS_PREFIX_URL = "https://ipfs.io/ipfs/";
  const contracts = ContractInstance();

  useEffect(() => {
    getNFTInfo();
  }, [openModal]);

  const getNFTInfo = async () => {
    await Moralis.start({
      apiKey: process.env.REACT_APP_MORALIS_API_KEY,
    });

    let ownedNFTs = await Moralis.EvmApi.account.getNFTs({
      address: address,
      chain: chain.id,
    });

    ownedNFTs = ownedNFTs._data.result.reverse();

    for (let i = 0; i < ownedNFTs.length; i++) {
      if (ownedNFTs[i].metadata) {
        ownedNFTs[i].imageURL =
          IPFS_PREFIX_URL + JSON.parse(ownedNFTs[i].metadata).image.slice(7);
      }
    }

    setNFTsOwned(ownedNFTs);
  };

  const mintNFT = async (receiver) => {
    const tx = await contracts.contractBAYC.safeMint(receiver);
  };

  const setPFP = async () => {
    setLoading(true);
    const tx = await contracts.contractPFP
      .setProfilePicture(NFTTokenURI)
      .catch(() => setLoading(false));
    await tx.wait().then(() => {
      setLoading(false);
      toggleOpenModal();
      setNFTTokenIndex();
      setNFTTokenURI();
    });
  };

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => {
        setLoading(false);
        toggleOpenModal();
        setNFTTokenIndex();
        setNFTTokenURI();
      }}
      style={modalStyles}
    >
      {isLoading ? (
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
          <div className="text-xl font-medium">Setting profile picture...</div>
        </div>
      ) : (
        <div className="flex flex-col w-[560px] py-4 px-4 gap-4">
          <div className="flex flex-row justify-between items-center">
            <code className="text-2xl">Set Profile Picture.</code>
            <button
              className="bg-[#333333] text-white p-1 hover:bg-[#555555] rounded-[8px]"
              onClick={() => mintNFT(address)}
            >
              Get NFT
            </button>
          </div>
          <div className="flex flex-wrap gap-5 max-x-[450px] overflow-y-auto max-h-[22vh]">
            {NFTsOwned.map((NFT, index) => {
              if (NFT.metadata) {
                return (
                  <button
                    key={index}
                    className={
                      "hover:opacity-50 " +
                      (index === NFTTokenIndex
                        ? "border border-[5px] border-black rounded-[10px]"
                        : "")
                    }
                    onClick={() => {
                      setNFTTokenIndex(index);
                      setNFTTokenURI(NFT.imageURL);
                    }}
                  >
                    {NFT.token_uri === null ? (
                      <div className="bg-black w-[75px] h-[75px] rounded-[5px]"></div>
                    ) : (
                      <img
                        className="h-[75px] rounded-[5px]"
                        src={NFT.imageURL}
                        alt=""
                      ></img>
                    )}
                  </button>
                );
              }
              return "";
            })}
          </div>
          <button
            className="text-lg items-center px-5 py-3 bg-[#333333] text-white font-bold rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={setPFP}
            disabled={!NFTTokenIndex}
          >
            Set
          </button>
        </div>
      )}
    </Modal>
  );
}
