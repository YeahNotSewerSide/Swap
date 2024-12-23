"use client";
import { ConnectBtn } from "@/components/connectButton";
import Profile from "@/components/profile";
import { useAccount } from "wagmi";
import Swap from "@/lib/web/web3Swap";

export default function Home() {
  const { isConnected } = useAccount();
 

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-6 md:p-8 lg:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      {isConnected && (<ConnectBtn />)}
      </div>
      <div className="p-6 bg-secondary rounded-lg shadow-lg relative w-full sm:w-3/4 md:w-2/3 lg:w-2/5 overflow-hidden">
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-opacity-90 bg-gray-100">
            <ConnectBtn />
          </div>
        )}
        <Swap />
      </div>

      <Profile />
    </main>
  );
}
