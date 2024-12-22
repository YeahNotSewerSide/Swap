// wagmi-config.ts
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';


const projectId = '951c0eea4a538ed2f6ac1842fc2a5625';

const aploNetwork = {
  id: 0x6e7a, // 28282 in decimal
  name: 'Aplo Network',
  nativeCurrency: { name: 'GAPLO', symbol: 'GAPLO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://pub1.aplocoin.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Aplo Explorer',
      url: 'https://explorer.aplocoin.com',
    },
  },
};

export const wagmiConfig = createConfig({
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
  ],
  chains: [mainnet, sepolia, aploNetwork],
  transports: {
    [mainnet.id]: http(),
    [aploNetwork.id]: http(),
  },
});
