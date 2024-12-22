import { type Chain } from "viem";
export const aplocoin = {
  id: 28282,
  name: "Aplo Network",
  nativeCurrency: {
    name: "GAPLO",
    symbol: "GAPLO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pub1.aplocoin.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Aplo Explorer",
      url: "https://explorer.aplocoin.com",
    },
  },
  contracts: {
    // Можно добавить контракты, если они известны
    // ensRegistry: { address: '...', blockCreated: ... },
    // ensUniversalResolver: { address: '...', blockCreated: ... },
    // multicall3: { address: '...', blockCreated: ... },
  },
} as const satisfies Chain;
