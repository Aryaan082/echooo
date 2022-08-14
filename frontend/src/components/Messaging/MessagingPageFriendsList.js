import { useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import moment from "moment";
import { theGraphClient } from "../../config";
import { GQL_QUERY_GET_COMMUNICATION_ADDRESS, GQL_QUERY_GET_UNKNOWN_SENDERS } from "../../constants";

import {
  addressEllipsePNG,
  continueIconColoredSVG,
  resetIconSVG,
} from "../../assets";

export default function FriendsList({
  chatAddresses,
  setChatAddresses,
  activeIndex,
  setActiveIndex,
  setActiveReceiver,
}) {
  const { address } = useAccount();
  const [showTrustedAddressList, setShowTrustedAddressList] = useState(true);
  
  const handleActiveReceiver = (e, index, address) => {
    setActiveIndex(index);
    setActiveReceiver(address);
  };

  const handleShowAddressList = async () => {      
      const graphClient = theGraphClient();
      const dataIdentity = await graphClient.query(
        GQL_QUERY_GET_COMMUNICATION_ADDRESS,
        {receiverAddress: address}
      ).toPromise();
      const dataIdentityTimestamp = dataIdentity.data.identities[0].timestamp;

      const dataMessages = await graphClient.query(
        GQL_QUERY_GET_UNKNOWN_SENDERS, {
          knownSenders: chatAddresses[address],
          receiverAddress: address,
          recentIdentityTimestamp: dataIdentityTimestamp      
        }
        ).toPromise();
      const dataMessagesParsed = dataMessages.data.messages;
      if (dataMessagesParsed == null) {
        return
      }
      const unknownChatAddresses = {}
      const unknownChatAddressesList = []
      for (let idx = 0; idx < dataMessagesParsed.length; idx++) {
        unknownChatAddresses[dataMessagesParsed[idx].from] = true;
      }
      console.log("messagesIdentityParsed >>>", dataMessagesParsed)
      setShowTrustedAddressList(!showTrustedAddressList);
      
  }

  return (
    <>
      {address in chatAddresses && chatAddresses[address].length > 0 ? (
        <>
          <div className="border-r-[3px] border-[#333333] border-opacity-10 w-[30%] pt-[4vh]">
            <div className="flex flex-row justify-between items-center px-[2vw]">
              <code className="text-xl font-semibold">Your anon chats</code>
              <button onClick={handleShowAddressList}>{showTrustedAddressList ? "Trusted Addresses" : "Unknown Addresses"}</button>
              <img
                className="h-[25px] hover:cursor-pointer"
                src={resetIconSVG}
                alt=""
                onClick={() => setChatAddresses({})}
              ></img>              
            </div>
            <ul className="Receivers">
              {chatAddresses[address].map((address, index) => {
                return (
                  <button
                    className="w-[80%] flex flex-row justify-between items-center px-4 py-4 font-bold rounded-[50px]"
                    key={index}
                    id={index === activeIndex ? "active" : "inactive"}
                    onClick={(event) =>
                      handleActiveReceiver(event, index, address)
                    }
                  >
                    <code className="flex flex-row items-center gap-4 text-lg">
                      <img src={addressEllipsePNG} alt=""></img>
                      {`${address.substring(0, 4)}...${address.substring(38)}`}
                    </code>
                    <img src={continueIconColoredSVG} alt=""></img>
                  </button>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center text-center border-r-[3px] border-[#333333] border-opacity-10 w-[30%]">
          <code>
            You have no chats, anon <br />
            ¯\_(ツ)_/¯
          </code>
        </div>
      )}
    </>
  );
}
