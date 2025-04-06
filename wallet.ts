export type ConnectedWallet = {
  address: string;
  chainId: number;
};

// Simple wallet connection via window.ethereum (MetaMask)
export async function connectWallet(): Promise<ConnectedWallet> {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet provider.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    
    // Get the chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    return {
      address,
      chainId: parseInt(chainId, 16),
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect wallet");
  }
}

// Format wallet address to shortened form
export function formatAddress(address: string | undefined): string {
  if (!address) return "Not connected";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Declare ethereum property on window
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
