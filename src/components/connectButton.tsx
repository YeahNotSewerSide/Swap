"use client";

import { useEffect, useRef } from "react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { emojiAvatarForAddress } from "@/lib/emojiAvatarForAddress";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export const ConnectBtn = () => {
  const { isConnecting, address, isConnected, chain } = useAccount();
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(
    address ?? ""
  );

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  if (!isConnected) {
    return (
      <Button
        onClick={async () => {
          // Disconnecting wallet first because sometimes when is connected but the user is not connected
          if (isConnected) {
            disconnect();
          }
          openConnectModal?.();
        }}
        disabled={isConnecting}
        className="h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 lg:px-10"
      >
        { isConnecting ? 'Connecting...' : 'Connect your wallet' }
      </Button>
    );
  }

  if (isConnected && !chain) {
    return (
      <Button
        className="h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 lg:px-10"
        onClick={openChainModal}
      >
        Wrong network
      </Button>
    );
  }

  return (
    <div className="max-w-5xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
      <Button
        className="h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 lg:px-10"
        onClick={async () => openAccountModal?.()}
      >
        <div
          role="button"
          tabIndex={1}
          className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            backgroundColor,
            boxShadow: "0px 2px 2px 0px rgba(81, 98, 255, 0.20)",
          }}
        >
          {emoji}
        </div>
        <p>Account</p>
      </Button>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Button
          className="h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 lg:px-10"
          onClick={openChainModal}
        >
          Switch Networks
        </Button>
        <ThemeSwitcher />
      </div>
    </div>
  );
};
