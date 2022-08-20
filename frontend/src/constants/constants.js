import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractEcho: "0x81B9DE4383571a209cB4290D98716e8Cf4eF86Fe",
    contractTokenTransfer: "0xA370673393CdEf99756F5289Bd03a46d31bdA4d8",
    contractWETH: "0xBA6De068521f757D8Bbbfc06041e6b768980F0Bf",
    contractUSDC: "0x10f0395866108E527e4687Ba9fAfbEB6A2030fF5",
    contractBAYC: "0x7A9472849fD95251C62689A0C4F545e49876eA78",
    logo: avalancheIconSVG,
    name: "Avalanche",
    baseToken: "AVAX",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echofuji",
    alchemyAPIConfig: "",
  },
  80001: {
    contractEcho: "0x5122f8a3f18d3ECa05aD26890647948FA319b633",
    contractTokenTransfer: "0x5837c38f202A2Cd56e7533BA574eef3c41557124",
    contractWETH: "0xF82D9fF908a823e9D8b348259a630ef9915e5E39",
    contractUSDC: "0xDDDC35FFAe3cabf560e36e23d18B36927d9b5a09",
    contractBAYC: "0x02e26af7ee5fED9DaB493cFf9B57F7fc78edd917",
    logo: polygonIconSVG,
    name: "Polygon",
    baseToken: "MATIC",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo",
    alchemyAPIConfig: "",
  },
  3: {
    contractEcho: "0xb02ab34142B528f905bB51B4AFF40B950031Fb12",
    contractTokenTransfer: "",
    contractWETH: "0xEC4E2A802E192d9422cc0053d6Ab7736bde97f2e",
    contractBAYC: "0xB046Dcd2957b15cdD922BFab7D08D661c98213fF",
    logo: ethereumIconSVG,
    name: "Ethereum",
    baseToken: "ETHER",
    alchemyAPIConfig: "",
  },
};

export const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
