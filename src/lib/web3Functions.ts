
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { ERC20_ABI, swapperABI } from "./abi";
import { useEthersSigner } from './useSigner'
let contract: ethers.Contract | null = null;
import { base } from "wagmi/chains";


// Initialize a contract instance using the provided address and ABI
export const initializeContract = (address: string): void => {
  const signer = useEthersSigner({ chainId: 28282 });

  if (!signer) throw new Error("Signer is not initialized");
  contract = new ethers.Contract(address, swapperABI, signer);
  console.log(`Contract initialized at address: ${address}`);
};

// Retrieve the pool ID for a token pair
export const getPoolId = async (token0: string, token1: string): Promise<string> => {
  if (!contract) throw new Error("Contract is not initialized");
  try {
    const poolId = await contract.getPoolId(token0, token1);
    return poolId;
  } catch (error) {
    console.error("Error getting pool ID:", error);
    throw error;
  }
};

// Approve a token for use in the contract
export const approveToken = async (
  tokenAddress: string,
  amount: string,
  contractAddress: string
): Promise<void> => {
  const { address: userAccount } = useAccount();
  const signer = useEthersSigner({ chainId: 28282 });

  if (!signer || !userAccount) {
    throw new Error("Signer or user account is not initialized");
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  try {
    const allowance = await tokenContract.allowance(userAccount, contractAddress);
    if (BigInt(allowance) < ethers.parseUnits(amount, 18)) {
      const tx = await tokenContract.approve(contractAddress, ethers.parseUnits(amount, 18));
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

// Swap tokens between pools
export const swapTokens = async (
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
    const tx = await contract.swap(poolId, token0, ethers.parseUnits(amountIn, 18));
    await tx.wait();
    console.log(`Successfully swapped ${amountIn} of ${token0}`);
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
};

// Define the Aplo Network configuration for network switching
const APLO_NETWORK = {
  chainId: "0x6e7a", // 28282 in hex
  chainName: "Aplo Network",
  rpcUrls: ["https://pub1.aplocoin.com"],
  nativeCurrency: {
    name: "GAPLO",
    symbol: "GAPLO",
    decimals: 18,
  },
  blockExplorerUrls: ["https://explorer.aplocoin.com"],
};

// Switch the wallet to the Aplo Network
export const switchToAploNetwork = async (): Promise<boolean> => {
  const signer = useEthersSigner({ chainId: 28282 });

  if (!signer) {
    throw new Error("Signer is not initialized");
  }

  try {
    const currentChainId = await signer.provider.getNetwork();
    currentChainId.chainId 

    if (currentChainId.chainId === BigInt(28282)) { // 0x6e7a in decimal
      console.log("Already on Aplo Network");
      return true;
    }

    await signer.provider.send("wallet_addEthereumChain", [APLO_NETWORK]);
    console.log("Aplo Network added and switched");
    return true;
  } catch (error) {
    console.error("Failed to switch network:", error);
    return false;
  }
};

// Get the price of tokens in the pool
export const getTokenPriceInPool = async (
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

// Calculate the amount to receive after a swap
export const calculateSwapAmount = async (
  token1: string,
  token2: string,
  amountIn: string,
  swapFee: string
): Promise<string> => {
  if (!contract) throw new Error("Contract is not initialized");

  const poolId = await contract.getPoolId(token1, token2);
  const pool = await contract.pools(poolId);

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
    ethers.parseUnits(swapFee, 18)
  );

  return ethers.formatUnits(amountOut, 18);
};
