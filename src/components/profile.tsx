"use client";

import { useAccount, useBalance } from "wagmi";
import { middleEllipsis } from "@/lib/utils";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";

const tokenAddresses: `0x${string}`[] = [
  "0x0000000000000000000000000000000000001235",
  "0x0000000000000000000000000000000000001234",
];

export default function Profile() {
  const { address } = useAccount();


  return (
    <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
      <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className="mb-3 text-2xl font-semibold">Wallet address</h2>
        <p className="m-0 w-[30ch] text-sm opacity-50">
          {middleEllipsis(address as string, 8) || ""}
        </p>
      </div>

      <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className={`mb-3 text-2xl font-semibold`}>Balance</h2>
        {tokenAddresses.map((token) => {
        const { data } = useBalance({
          address,
          token,
        });

        return (
          <div key={token} className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            {data ? (
              <p>
                {Number(formatUnits(data.value, data.decimals)).toFixed(4)} {data.symbol || "Gaplo"}
              </p>
            ) : (
              <div />
            )}
          </div>
        );
      })}
      </div>

      <Link href="https://aplocoin.com/" target="_blank">
        <div className="h-full flex items-center justify-center group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <Image
            src="/Aplocoin.png"
            height={72}
            width={72}
            alt="InterFuse"
          />
        </div>
      </Link>

      <Link href="https://interfuse.agency/" target="_blank">
        <div className="h-full flex items-center justify-center group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <Image
            src="/InterFuse.svg"
            height={55}
            width={72}
            alt="InterFuse"
            style={{ width: 72, height: 55 }}
            className="mix-blend-difference"
          />
        </div>
      </Link>
    </div>
  );
}
