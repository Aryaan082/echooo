import { useContract, useNetwork, useSigner } from "wagmi";

import EchoJSON from "../contracts/Echo.sol/Echo.json";
import { CONTRACT_META_DATA } from "../constants";

// TODO: change this to a hook instead of a react component
const ContractInstance = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const contractEcho = useContract({
    addressOrName: CONTRACT_META_DATA[chain.id].contractAddress,
    contractInterface: EchoJSON.abi,
    signerOrProvider: signer,
  });

  return contractEcho;
};

export default ContractInstance;
