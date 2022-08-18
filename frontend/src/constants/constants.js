import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractAddress: "0x81B9DE4383571a209cB4290D98716e8Cf4eF86Fe",
    logo: avalancheIconSVG,
    name: "Avalanche",
    baseToken: "AVAX",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echofuji",
    alchemyAPIConfig: "",
    WETHAddress: "0xBA6De068521f757D8Bbbfc06041e6b768980F0Bf",
    NFTAddress: "0xd1f246258155d114f9B7C369A9d32eb0feA17aE5",
  },
  80001: {
    contractAddress: "0x5122f8a3f18d3ECa05aD26890647948FA319b633",
    logo: polygonIconSVG,
    name: "Polygon",
    baseToken: "MATIC",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo",
    alchemyAPIConfig: "",
    WETHAddress: "0xF82D9fF908a823e9D8b348259a630ef9915e5E39",
    NFTAddress: "0xB046Dcd2957b15cdD922BFab7D08D661c98213fF",
  },
  3: {
    contractAddress: "0xb02ab34142B528f905bB51B4AFF40B950031Fb12",
    logo: ethereumIconSVG,
    name: "Ethereum",
    baseToken: "ETHER",
    alchemyAPIConfig: "",
    WETHAddress: "0xEC4E2A802E192d9422cc0053d6Ab7736bde97f2e",
  },
};

export const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
