import { CONTRACT_META_DATA } from "../constants";
import { createClient } from "urql";
import "isomorphic-unfetch"; // required for urql: https://github.com/FormidableLabs/urql/issues/283

// TODO: is there a better way to pass in the chainID?
export const initGraphClient = async () => {
    const chainID = parseInt(window.ethereum.networkVersion);
    const graphApiUrl = CONTRACT_META_DATA[chainID].theGraphAPI;
    const graphClient = createClient({
        url: graphApiUrl,
    });
    return graphClient;
};