import { useContract, useNetwork, useSigner } from "wagmi";

import EchoJSON from "../contracts/Echo.json";
import TokenTransferJSON from "../contracts/TokenTransfer.json";
import WETHJSON from "../contracts/WETH.json";
import ERC20JSON from "../contracts/ERC20.json";
import BAYCJSON from "../contracts/BoredApeYachtClubTest.json";

import { CONTRACT_META_DATA } from "../constants";

// TODO: change this to a hook instead of a react component
const ContractInstance = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const contractEcho = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractEcho
        : "",
    contractInterface: EchoJSON.abi,
    signerOrProvider: signer,
  });

  const contractTokenTransfer = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractTokenTransfer
        : "",
    contractInterface: TokenTransferJSON.abi,
    signerOrProvider: signer,
  });

  const contractWETH = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractWETH
        : "",
    contractInterface: WETHJSON.abi,
    signerOrProvider: signer,
  });

  const contractUSDC = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractUSDC
        : "",
    contractInterface: ERC20JSON.abi,
    signerOrProvider: signer,
  });

  const contractBAYC = useContract({
    addressOrName:
      chain.id in CONTRACT_META_DATA
        ? CONTRACT_META_DATA[chain.id].contractBAYC
        : "",
    contractInterface: BAYCJSON.abi,
    signerOrProvider: signer,
  });

  return {
    contractEcho,
    contractTokenTransfer,
    contractWETH,
    contractUSDC,
    contractBAYC,
  };
};

export default ContractInstance;
