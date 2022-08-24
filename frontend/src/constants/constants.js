import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractEcho: "0x31d635F65a21309BC3115b1D61fAffF003f740Fb",
    contractTokenTransfer: "0xA370673393CdEf99756F5289Bd03a46d31bdA4d8",
    contractWETH: "0xBA6De068521f757D8Bbbfc06041e6b768980F0Bf",
    contractUSDC: "0x10f0395866108E527e4687Ba9fAfbEB6A2030fF5",
    contractBAYC: "0x7A9472849fD95251C62689A0C4F545e49876eA78",
    contractPFP: "0xb813F9fC180D122e83002aC4d4d6fEB2bCD303B8",
    contractRequestNFT: "0x9B6Ca0fB4debd21b17C56EDEd42ABc556a2989Cf",
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
    contractPFP: "0xD92BC54aAAdd1Fe84C87AB55f415e85B12643Ac5",
    contractRequestNFT: "0x9E209b9103f84A72c5F66519C78582b8CD863860",
    logo: polygonIconSVG,
    name: "Polygon",
    baseToken: "MATIC",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo",
    alchemyAPIConfig: "",
  },
  5: {
    contractEcho: "0x13aeAe99bA955A20Cd8d64bd3e5eFAb08388D738",
    contractTokenTransfer: "0x197B537b91Be74d60c964Cda6f0B277516340B5d",
    contractPFP: "0x9C82267bB1f6a64154de94332936F876674A8444",
    contractRequestNFT: "0x486Daca0D31f24EeA577eE1BDD40f8c7B49F8bd2",
    contractWETH: "0xEb1a2E15D3BfA3c536ff8C2a4f5f7270667417b3",
    contractUSDC: "0x71A14752A60520Fcb2fF7aeD410F3a9eD6774a1C",
    contractBAYC: "0x1Bcef880B67072ba0D8e7B6a6d104446ADD46E53",
    logo: ethereumIconSVG,
    name: "Ethereum",
    baseToken: "ETHER",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echogoerli",
    alchemyAPIConfig: "",
  },
};

export const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
