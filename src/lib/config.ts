'use client';

import { http, createStorage, cookieStorage } from 'wagmi';
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { aplocoin } from '@/config/aplocoin';

const projectId = "951c0eea4a538ed2f6ac1842fc2a5625";

const supportedChains: Chain[] = [ aplocoin ];

export const config = getDefaultConfig({
   appName: "WalletConnection",
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 });