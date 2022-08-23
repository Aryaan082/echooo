import { CONTRACT_META_DATA } from "../constants";
import { createClient } from "urql";
import "isomorphic-unfetch"; // required for urql: https://github.com/FormidableLabs/urql/issues/283
import { useNetwork } from "wagmi";

export const theGraphClient = () => {
  // TODO: replace this with a chainId function parameter -> need to make it so theGraphClient is called only once
  const chainID = parseInt(window.ethereum.networkVersion);
  const graphApiUrl = CONTRACT_META_DATA[chainID].theGraphAPI;
  const graphClient = createClient({
    url: graphApiUrl,
  });
  return graphClient;
};

// TODO: move to hooks
export const useTheGraphClient = () => {
  const { chain } = useNetwork();
  const graphApiUrl = CONTRACT_META_DATA[chain.id].theGraphAPI;
  const graphClient = createClient({
    url: graphApiUrl,
  });
  return graphClient;
};
