import { useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import { useTheGraphClient } from "../../config";
import { GQL_QUERY_GET_COMMUNICATION_ADDRESS, GQL_QUERY_GET_UNKNOWN_SENDERS } from "../../constants";

import {
  addressEllipsePNG,
  cancelIconSVG,
  plusIconBlackSVG,
} from "../../assets";

// TODO: Make separate React components
const EmptyFriendsList = () => {
  return (
    <div className="flex flex-col justify-center text-center border-[#333333] border-opacity-10">
      <code>
        You have no chats, anon <br />
        ¯\_(ツ)_/¯
      </code>
    </div>
  )
}

const FriendsListTab = ({ handleShowAddressList, showTrustedAddressList, setShowTrustedAddressList }) => {
  return (
    <div className="flex flex-row justify-between items-center px-[2vw]">
      <button onClick={() => setShowTrustedAddressList(true)}>
        <code
          className={
            "text-lg font-semibold " +
            (!showTrustedAddressList ? "opacity-50" : "")
          }
        >
          Accepted chats
        </code>
      </button>
      <button onClick={handleShowAddressList}>
        <code
          className={
            "text-lg font-semibold " +
            (showTrustedAddressList ? "opacity-50" : "")
          }
        >
          Requested chats
        </code>
      </button>
    </div>
  )
}

export default function FriendsList({
  chatAddresses,
  setChatAddresses,
  activeIndex,
  setActiveIndex,
  setActiveReceiver,
  unknownChatAddresses,
  setUnknownChatAddresses,
  showTrustedAddressList,
  setShowTrustedAddressList
}) {
  const { address } = useAccount();  
  const graphClient = useTheGraphClient();  
  const handleActiveReceiver = (e, index, address) => {
    setActiveIndex(index);
    setActiveReceiver(address);
  };

  const handleShowAddressList = async () => {    
    const dataIdentity = await graphClient.query(
      GQL_QUERY_GET_COMMUNICATION_ADDRESS,
      { receiverAddress: address }
    ).toPromise();
    const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;

    let currentChatAddresses = chatAddresses[address]

    if (currentChatAddresses == null || currentChatAddresses.length === 0) {
      currentChatAddresses = [""]
    }

    console.log("handleShowAddressList: knownSenders", chatAddresses[address])
    const dataMessages = await graphClient.query(
      GQL_QUERY_GET_UNKNOWN_SENDERS, {
      knownSenders: currentChatAddresses,
      receiverAddress: address,
      recentIdentityTimestamp: dataIdentityTimestamp
    }
    ).toPromise();
    console.log("handleShowAddressList: dataMessages", dataMessages)
    const dataMessagesParsed = dataMessages.data.messages;
    console.log("handleShowAddressList: dataMessagesParsed", dataMessagesParsed)
    if (dataMessagesParsed == null) {
      return
    }

    const unknownAddresses = {}
    for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
      unknownAddresses[dataMessagesParsed[idx].from] = true;
    }

    // keep in this format to stay consistent with chat addresses + cacheing potential
    const newUnknownChatAddresses = Object.assign(unknownChatAddresses, { [address]: Object.keys(unknownAddresses) })

    setUnknownChatAddresses(newUnknownChatAddresses)
    setShowTrustedAddressList(false)
  }

  const handleAddAddress = (index, friendAddress) => {
    console.log("handleAddAddress:index >>>", index)
    console.log("handleAddAddress:addresses >>>", chatAddresses[address])
    console.log("handleAddAddress:friend address >>>", friendAddress)

    let unknownAddressesTemp = Object.assign(
      {},
      unknownChatAddresses
    );

    if (index >= 0) {
      setChatAddresses(
        (current) => {
          console.log("handleAddAddress:current >>>", current)
          const chatAddressesTemp = Object.assign(
            {},
            current
          );

          if (
            Object.keys(unknownAddressesTemp).length !== 0 &&
            address in unknownAddressesTemp
          ) {
            chatAddressesTemp[address].push(friendAddress);
            console.log("handleAddAddress:chatAddressesTemp after >>>", chatAddressesTemp)
            unknownAddressesTemp[address] = unknownAddressesTemp[address].filter(item => item !== friendAddress) 
            // unknownAddressesTemp[address].splice(index, 1);
            setUnknownChatAddresses(unknownAddressesTemp);
          }
          // setActiveReceiver(chatAddressesTemp[chatAddressesTemp.length]);
          // setActiveIndex(0);

          return chatAddressesTemp;
        });
    }
    setShowTrustedAddressList(true)
    console.log(chatAddresses[address]);
  }

  const handleRemoveAddress = (index, friendAddress) => {
    console.log("handleRemoveAddress:index >>>", index)
    if (index >= 0) {
      setChatAddresses(
        (current) => {
          console.log("handleRemoveAddress:current >>>", current)
          let chatAddressesTemp = Object.assign(
            {},
            current
          );          
          if (
            Object.keys(chatAddressesTemp).length !== 0 &&
            address in chatAddressesTemp
          ) {
            console.log("handleRemoveAddress:chatAddressesTemp before splice >>>", chatAddressesTemp)
            chatAddressesTemp[address] = chatAddressesTemp[address].filter(item => item !== friendAddress) 
            // chatAddressesTemp[address].splice(index, 1);
            console.log("handleRemoveAddress:chatAddressesTemp splice >>>", chatAddressesTemp)
          }
          // setActiveIndex(0);
          // setActiveReceiver(chatAddressesTemp[0]);          
          return chatAddressesTemp;
        });
    }
  }

  return (
    <>
      <>
        <div className="border-r-[3px] border-[#333333] border-opacity-10 w-[30%] pt-[4vh]">
          <FriendsListTab handleShowAddressList={handleShowAddressList} showTrustedAddressList={showTrustedAddressList} setShowTrustedAddressList={setShowTrustedAddressList} />
          <ul className="Receivers">
            {showTrustedAddressList ? (
              address in chatAddresses && chatAddresses[address].length > 0 ?
                chatAddresses[address].map((friendAddress, index) => {
                  return (
                    <button
                      className="w-[80%] flex flex-row justify-between items-center px-4 py-4 font-bold rounded-[50px]"
                      key={index}
                      id={index === activeIndex ? "active" : "inactive"}
                      onClick={(event) =>
                        handleActiveReceiver(event, index, friendAddress)
                      }
                    >
                      <code className="flex flex-row items-center gap-4 text-lg">
                        <img src={addressEllipsePNG} alt=""></img>
                        {`${friendAddress.substring(
                          0,
                          4
                        )}...${friendAddress.substring(38)}`}
                      </code>
                      <button
                        onClick={() => handleRemoveAddress(index, friendAddress)}
                      >
                        <img
                          className="h-6 p-1 hover:bg-[#ffffff] rounded-[50px]"
                          src={cancelIconSVG}
                          alt=""
                        ></img>
                      </button>
                    </button>
                  );
                })
                : (
                  <EmptyFriendsList />
                )) : (
              <>
                {
                  (unknownChatAddresses[address].length > 0) ?
                    unknownChatAddresses[address].map((friendAddress, index) => {
                      return (
                        <button
                          className="w-[80%] flex flex-row justify-between items-center px-4 py-4 font-bold rounded-[50px]"
                          key={index}
                          id={index === activeIndex ? "active" : "inactive"}
                          onClick={(event) =>
                            handleActiveReceiver(event, index, friendAddress)
                          }
                        >
                          <code className="flex flex-row items-center gap-4 text-lg">
                            <img src={addressEllipsePNG} alt=""></img>
                            {`${friendAddress.substring(
                              0,
                              4
                            )}...${friendAddress.substring(38)}`}
                          </code>
                          <button
                            onClick={() => handleAddAddress(index, friendAddress)}
                          >
                            <img
                              className="h-6 p-1 hover:bg-[#ffffff] rounded-[50px]"
                              src={plusIconBlackSVG}
                              alt=""
                            ></img>
                          </button>
                        </button>
                      );
                    })
                    : <EmptyFriendsList />
                }
              </>
            )}
          </ul>
        </div>
      </>
    </>
  );
}
