import { ethers } from "ethers";
import { ERC20_ABI, swapperABI } from "./abi";

let provider: ethers.BrowserProvider | undefined;
let signer: ethers.Signer | undefined;
let contract: ethers.Contract | undefined;
let userAccount: string | undefined;

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async (): Promise<string> => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAccount = await signer.getAddress();

    console.log("Connected with account:", userAccount);

    return userAccount;
  } else {
    alert("Please install MetaMask!");
    throw new Error("MetaMask not installed");
  }
};

export const initializeContract = (address: string) => {
  if (!signer) throw new Error("Signer is not initialized");
  contract = new ethers.Contract(address, swapperABI, signer);
  console.log(`Contract initialized at address: ${address}`);
};

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

export const approveToken = async (tokenAddress: string, amount: string, contractAddress: string): Promise<void> => {
  if (!signer || !userAccount) {
    throw new Error("Signer or user account is not initialized");
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  try {
    const allowance = await tokenContract.allowance(userAccount, contractAddress);
    if (ethers.getBigInt(allowance) < ethers.parseUnits(amount, 18)) {
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

export const switchToAploNetwork = async (): Promise<boolean> => {
  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (currentChainId === APLO_NETWORK.chainId) {
      console.log("Already on Aplo Network");
      return true;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: APLO_NETWORK.chainId }],
      });
      console.log("Switched to Aplo Network");
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [APLO_NETWORK],
        });
        console.log("Aplo Network added and switched");
        return true;
      } else {
        console.error("Failed to switch network:", error);
        return false;
      }
    }
  } catch (error) {
    console.error("Error checking or switching network:", error);
    return false;
  }
};
