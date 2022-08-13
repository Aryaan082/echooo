import { useState } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import moment from "moment";
import { theGraphClient } from "../../config";
import { GQL_QUERY_GET_UNKNOWN_SENDERS } from "../../constants";

import {
  addressEllipsePNG,
  continueIconColoredSVG,
  resetIconSVG,
  cancelIconSVG,
} from "../../assets";
import { useEffect } from "react";

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

  const handleShowAddressList = () => {
    setShowTrustedAddressList(!showTrustedAddressList);
  };

  return (
    <>
      {address in chatAddresses && chatAddresses[address].length > 0 ? (
        <>
          <div className="border-r-[3px] border-[#333333] border-opacity-10 w-[30%] pt-[4vh]">
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
              <button onClick={() => setShowTrustedAddressList(false)}>
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
            <ul className="Receivers">
              {showTrustedAddressList ? (
                <>
                  {chatAddresses[address].map((friendAddress, index) => {
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
                          onClick={() => {
                            console.log(chatAddresses[address]);
                            if (index > -1) {
                              setChatAddresses((current) => {
                                const chatAddressesTemp = Object.assign(
                                  {},
                                  current
                                );
                                if (
                                  Object.keys(chatAddresses).length !== 0 &&
                                  address in chatAddresses
                                ) {
                                  chatAddressesTemp[address].splice(index, 1);
                                }
                                setActiveIndex(0);
                                return chatAddressesTemp;
                              });
                            }
                            console.log(chatAddresses[address]);
                          }}
                        >
                          <img
                            className="h-6 p-1 hover:bg-[#ffffff] rounded-[50px]"
                            src={cancelIconSVG}
                            alt=""
                          ></img>
                        </button>
                      </button>
                    );
                  })}
                </>
              ) : (
                <>FILL ME UP</>
              )}
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
