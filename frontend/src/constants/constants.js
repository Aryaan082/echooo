import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractAddress: "0x13aeAe99bA955A20Cd8d64bd3e5eFAb08388D738",
    logo: avalancheIconSVG,
    name: "Avalanche",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echofuji",
    WETHAddress: "0xBA6De068521f757D8Bbbfc06041e6b768980F0Bf",
  },
  80001: {
    contractAddress: "0xb1b7467ae050C9CF91C71d8cb51c6Acc672D5157",
    logo: polygonIconSVG,
    name: "Polygon",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo",
    WETHAddress: "0xF82D9fF908a823e9D8b348259a630ef9915e5E39",
  },
  3: {
    contractAddress: "0xb02ab34142B528f905bB51B4AFF40B950031Fb12",
    logo: ethereumIconSVG,
    name: "Ethereum",
    WETHAddress: "0xEC4E2A802E192d9422cc0053d6Ab7736bde97f2e",
  },
};

export const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";