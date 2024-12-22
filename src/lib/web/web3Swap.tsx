"use client";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { ERC20_ABI, swapperABI } from "./abi";
import { useEthersSigner } from "@/hooks/useSigner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function Swap() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const signer = useEthersSigner();
  const { address: userAccount } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInitializeContract = () => {
    if (!contractAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid contract address.",
      });
      return;
    }
    try {
      initializeContract(contractAddress);
      toast({
        title: "Success",
        description: "Contract initialized successfully!",
      });
    } catch (error) {
      console.error("Contract initialization failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Contract initialization failed.",
        action: (
          <ToastAction onClick={handleInitializeContract} altText="Try again">
            Try again
          </ToastAction>
        ),
      });
    }
  };

  const handleSwap = async () => {
    try {
      await swapTokens(token0, token1, amount, contractAddress);
      toast({
        title: "Success",
        description: "Swap completed successfully!",
      });
    } catch (error) {
      console.error("Swap failed:", error);
      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: "There was a problem with your swap request.",
        action: (
          <ToastAction onClick={handleSwap} altText="Try again">
            Try again
          </ToastAction>
        ),
      });
    }
  };

  const initializeContract = (address: string): void => {
    if (!signer) throw new Error("Signer is not initialized");

    try {
      // Check if the address is a valid Ethereum address
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid contract address format");
      }

      setContract(new ethers.Contract(address, swapperABI, signer));
    } catch (error: any) {
      throw error;
    }
  };

  const getPoolId = async (token0: string, token1: string): Promise<string> => {
    if (!contract) throw new Error("Contract is not initialized");
    try {
      const poolId = await contract.getPoolId(token0, token1);
      return poolId;
    } catch (error) {
      console.error("Error getting pool ID:", error);
      throw error;
    }
  };

  const approveToken = async (
    tokenAddress: string,
    amount: string,
    contractAddress: string
  ): Promise<void> => {
    if (!signer || !userAccount) {
      throw new Error("Signer or user account is not initialized");
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    try {
      const allowance = await tokenContract.allowance(
        userAccount,
        contractAddress
      );
      if (BigInt(allowance) < ethers.parseUnits(amount, 18)) {
        const tx = await tokenContract.approve(
          contractAddress,
          ethers.parseUnits(amount, 18)
        );
        await tx.wait();
        console.log("Token approved");
      } else {
        console.log("Allowance already sufficient");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const swapTokens = async (
    token0: string,
    token1: string,
    amountIn: string,
    contractAddress: string
  ): Promise<void> => {
    if (!contract) throw new Error("Contract is not initialized");

    if (!ethers.isAddress(token0) || !ethers.isAddress(token1)) {
      throw new Error("Invalid token addresses");
    }

    if (parseFloat(amountIn) <= 0) {
      throw new Error("Invalid amount");
    }

    const poolId = await getPoolId(token0, token1);
    if (!poolId) {
      throw new Error("Pool does not exist!");
    }

    console.log("Swapping tokens in pool:", poolId);

    await approveToken(token0, amountIn, contractAddress);

    try {
      const tx = await contract.swap(
        poolId,
        token0,
        ethers.parseUnits(amountIn, 18)
      );
      await tx.wait();
      console.log(`Successfully swapped ${amountIn} of ${token0}`);
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  };

  const getTokenPriceInPool = async (
    token0: string,
    token1: string
  ): Promise<{ priceToken0: number; priceToken1: number }> => {
    if (!contract) throw new Error("Contract is not initialized");

    const poolId = await contract.getPoolId(token0, token1);
    const pool = await contract.pools(poolId);

    const token0Reserve = ethers.formatUnits(pool.token0Reserve, 18);
    const token1Reserve = ethers.formatUnits(pool.token1Reserve, 18);

    const priceToken0 = parseFloat(token1Reserve) / parseFloat(token0Reserve);
    const priceToken1 = parseFloat(token0Reserve) / parseFloat(token1Reserve);

    return {
      priceToken0,
      priceToken1,
    };
  };

  const calculateSwapAmount = async (
    token1: string,
    token2: string,
    amountIn: string
  ): Promise<string> => {
    if (!contract) throw new Error("Contract is not initialized");

    const poolId = await contract.getPoolId(token1, token2);
    const pool = await contract.pools(poolId);

    // Get swap fee from the contract
    const swapFee = await contract.getSwapFee(poolId);
    const swapFeeFormatted = ethers.formatUnits(swapFee, 18);

    let inputReserve: any;
    let outputReserve: any;

    if (pool.token0.toLowerCase() === token1.toLowerCase()) {
      inputReserve = pool.token0Reserve;
      outputReserve = pool.token1Reserve;
    } else if (pool.token1.toLowerCase() === token1.toLowerCase()) {
      inputReserve = pool.token1Reserve;
      outputReserve = pool.token0Reserve;
    } else {
      throw new Error("Token pair not found in the pool.");
    }

    const amountOut = await contract.getSwapAmount(
      ethers.parseUnits(amountIn, 18),
      inputReserve,
      outputReserve,
      swapFee // Using the fee directly from contract
    );

    return ethers.formatUnits(amountOut, 18);
  };

  useEffect(() => {
    const updateEstimatedOutput = async () => {
      if (amount && token0 && token1) {
        try {
          const output = await calculateSwapAmount(token0, token1, amount);
          setEstimatedOutput(output);
        } catch (error) {
          console.error("Error calculating swap amount:", error);
          setEstimatedOutput("Error calculating amount");
        }
      }
    };
    updateEstimatedOutput();
  }, [amount, token0, token1]);
  
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Label htmlFor="contractAddress">Contract Address:</Label>
        <Input
          type="text"
          id="contractAddress"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Enter Contract Address"
          style={{ marginBottom: "0.5rem" }}
        />
        <Button onClick={handleInitializeContract} className="mt-2">
          Initialize Contract
        </Button>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Label htmlFor="token0">Token Address:</Label>
        <Input
          type="text"
          id="token0"
          value={token0}
          onChange={(e) => setToken0(e.target.value)}
          placeholder="Enter Token 0 Address"
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Label htmlFor="token1">To token Address:</Label>
        <Input
          type="text"
          id="token1"
          value={token1}
          onChange={(e) => setToken1(e.target.value)}
          placeholder="Enter Token 1 Address"
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Label htmlFor="amount">Amount to Swap:</Label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
        />
        <Label htmlFor="amount">:</Label>
        {amount && token0 && token1 && (
          <div className="mt-2">
            <p>Estimated output:</p>
            {estimatedOutput}
          </div>
        )}
      </div>
      <Button onClick={handleSwap} className="mt-4">
        Swap Tokens
      </Button>
    </>
  );
}
