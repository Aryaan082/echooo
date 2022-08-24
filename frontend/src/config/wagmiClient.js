import {
    createClient,
    chain,
    configureChains,
} from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

const alchemyId = process.env.ALCHEMY_ID;

const avalancheChain = {
    id: 43113,
    name: "Avalanche FUJI Testnet",
    network: "avalanche",
    nativeCurrency: {
        decimals: 18,
        name: "Avalanche",
        symbol: "AVAX",
    },
    rpcUrls: {
        default: "https://api.avax-test.network/ext/bc/C/rpc",
    },
    blockExplorers: {
        default: { name: "SnowTrace", url: "https://snowtrace.io" },
    },
    testnet: false,
};

const { chains, provider, webSocketProvider } = configureChains(
    [avalancheChain, chain.polygonMumbai, chain.goerli],
    [alchemyProvider({ alchemyId }), publicProvider()]
);

export const wagmiClient = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: "wagmi",
            },
        }),
        new WalletConnectConnector({
            chains,
            options: {
                qrcode: true,
            },
        }),
        new InjectedConnector({
            chains,
            options: {
                name: "Injected",
                shimDisconnect: true,
            },
        }),
    ],
    provider,
    webSocketProvider,
});