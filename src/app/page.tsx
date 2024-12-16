"use client";
import { useState } from "react";
import {
  connectWallet,
  initializeContract,
  approveToken,
  swapTokens,
  switchToAploNetwork,
} from "@/lib/web3Functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");

  const handleConnectWallet = async () => {
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInitializeContract = () => {
    if (!contractAddress) {
      alert("Please enter a valid contract address.");
      return;
    }
    initializeContract(contractAddress);
    alert("Contract initialized!");
  };

  const handleApproveToken = async () => {
    try {
      if (!tokenAddress || !amount) {
        alert("Please fill in all fields.");
        return;
      }
      await approveToken(tokenAddress, amount, contractAddress);
      alert("Token approved successfully!");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Check console for details.");
    }
  };

  const handleSwap = async () => {
    try {
      const switched = await switchToAploNetwork();
      if (!switched) {
        alert("Please switch to Aplo Network to proceed with the swap.");
        return;
      }

      await swapTokens(token0, token1, amount, contractAddress);
      alert("Swap successful!");
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Swap failed. Check console for details.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="p-6 bg-white rounded-lg shadow-lg relative w-2/5 overflow-hidden">
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-opacity-90 bg-gray-100">
            <img
              src="https://metamask.io/assets/icon.svg"
              alt="MetaMask Logo"
              className="w-16 h-16 mb-4"
            />
            <Button onClick={handleConnectWallet} className="mx-auto">
              Connect MetaMask
            </Button>
          </div>
        )}

        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="swap">Swap Tokens</TabsTrigger>
            <TabsTrigger value="approve">Approve Token</TabsTrigger>
          </TabsList>

          <TabsContent value="approve">
            <div className="mb-4">
              <Label htmlFor="contractAddress">Contract Address:</Label>
              <Input
                type="text"
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter Contract Address"
              />
              <Button onClick={handleInitializeContract} className="mt-2">
                Initialize Contract
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="tokenAddress">Token Address:</Label>
              <Input
                type="text"
                id="tokenAddress"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter Token Address"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="amount">Amount:</Label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button onClick={handleApproveToken} className="mt-4">
              Approve Token
            </Button>
          </TabsContent>

          <TabsContent value="swap">
            <div className="mb-4">
              <Label htmlFor="contractAddress">Contract Address:</Label>
              <Input
                type="text"
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter Contract Address"
              />
              <Button onClick={handleInitializeContract} className="mt-2">
                Initialize Contract
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="token0">Token Address:</Label>
              <Input
                type="text"
                id="token0"
                value={token0}
                onChange={(e) => setToken0(e.target.value)}
                placeholder="Enter Token 0 Address"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="token1">To token Address:</Label>
              <Input
                type="text"
                id="token1"
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                placeholder="Enter Token 1 Address"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="amount">Amount to Swap:</Label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
              />
            </div>
            <Button onClick={handleSwap} className="mt-4">
              Swap Tokens
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
