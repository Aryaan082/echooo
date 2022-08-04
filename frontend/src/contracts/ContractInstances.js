import { useContract, useNetwork, useSigner } from "wagmi";

import EchoJSON from "./Echo.sol/Echo.json";

const contractEchoAddress = {
  43113: "0x13aeAe99bA955A20Cd8d64bd3e5eFAb08388D738", // AVAX FUJI
  80001: "0xb1b7467ae050C9CF91C71d8cb51c6Acc672D5157", // POLYGON MUMBAI
};

export default function ContractInstances() {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const contractEcho = useContract({
    addressOrName: contractEchoAddress[chain.id],
    contractInterface: EchoJSON.abi,
    signerOrProvider: signer,
  });

  return contractEcho;
}
