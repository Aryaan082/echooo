import { avalancheIconSVG, ethereumIconSVG, polygonIconSVG } from "../assets";

// TODO: find better way to split constants across more relevant folders

export const CONTRACT_META_DATA = {
  43113: {
    contractAddress: "0x197B537b91Be74d60c964Cda6f0B277516340B5d",
    logo: avalancheIconSVG,
    name: "Avalanche",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echofuji",
    alchemyAPIConfig: "",
    WETHAddress: "0xBA6De068521f757D8Bbbfc06041e6b768980F0Bf",
    NFTAddress: "0xd1f246258155d114f9B7C369A9d32eb0feA17aE5",
  },
  80001: {
    contractAddress: "0x916AbE4ee97D6288eE7A8F24857C7e20a4dfe621",
    logo: polygonIconSVG,
    name: "Polygon",
    theGraphAPI: "https://api.thegraph.com/subgraphs/name/mtwichan/echo",
    alchemyAPIConfig: "",
    WETHAddress: "0xF82D9fF908a823e9D8b348259a630ef9915e5E39",
    NFTAddress: "0xB046Dcd2957b15cdD922BFab7D08D661c98213fF",
  },
  3: {
    contractAddress: "0xb02ab34142B528f905bB51B4AFF40B950031Fb12",
    logo: ethereumIconSVG,
    name: "Ethereum",
    alchemyAPIConfig: "",
    WETHAddress: "0xEC4E2A802E192d9422cc0053d6Ab7736bde97f2e",
  },
};

export const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
