import { useContract, useNetwork, useSigner } from "wagmi";

import EchoJSON from "../contracts/Echo.json";
import WETHJSON from "../contracts/WETH.json";

import { CONTRACT_META_DATA } from "../constants";

// TODO: change this to a hook instead of a react component
const ContractInstance = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const contractEcho = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractAddress
        : "",
    contractInterface: EchoJSON.abi,
    signerOrProvider: signer,
  });

  const contractWETH = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].WETHAddress
        : "",
    contractInterface: WETHJSON.abi,
    signerOrProvider: signer,
  });

  return { contractEcho, contractWETH };
};

export default ContractInstance;
