import { useConnect, useNetwork, useSwitchNetwork } from "wagmi";
import { Oval } from "react-loader-spinner";

import ChainSelectorButton from "./ChainSelectorButton.js";
import { CONTRACT_META_DATA } from "../../constants/constants.js";

export default function ChainSelector() {
  const { error, isLoading } =
    useConnect();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();

  return (
    <div>
      {!isLoading ? (
        <>
          <div className="font-medium text-left pb-[20px]">
            Select a blockchain
          </div>
          <div className="flex flex-col gap-[10px] items-center">
            {chains.map((c) => {
              return <ChainSelectorButton
                name={CONTRACT_META_DATA[c.id].name}
                logo={CONTRACT_META_DATA[c.id].logo}
                chainId={c.id}
                selectedChainId={chain.id}
                switchNetwork={switchNetwork}
              />
            })}  
            {error && <div>{error.message}</div>}
          </div>
        </>
      ) : (
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
          <div className="text-xl font-medium">Connecting...</div>
        </div>
      )}
    </div>
  );
}
