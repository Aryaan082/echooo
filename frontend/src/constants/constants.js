import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractAddress: "0x13aeAe99bA955A20Cd8d64bd3e5eFAb08388D738",
    logo: avalancheIconSVG,
    name: "Avalanche Fuji",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echofuji"
  },
  80001: {
    contractAddress: "0xb1b7467ae050C9CF91C71d8cb51c6Acc672D5157",
    logo: polygonIconSVG,
    name: "Polygon Mumbai",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo"
  },
  3: {
    contractAddress: "",
    logo: ethereumIconSVG,
    name: "Ethereum Ropsten"
  }
};
