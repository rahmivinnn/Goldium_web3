import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Stable RPC connection for balance fetching
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

export async function fetchBalance(publicKey: PublicKey | string): Promise<number> {
  if (!publicKey) {
    throw new Error("Public key is null");
  }

  try {
    // Convert string to PublicKey if needed
    const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
    
    // Get balance in lamports
    const balanceLamports = await connection.getBalance(pubKey);
    
    // Convert to SOL
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
    
    // Return real balance only - no mock data per user requirement
    return balanceSOL;
  } catch (error: any) {
    console.error('Balance fetch error:', error.message);
    
    // Try fallback RPC
    try {
      const fallbackConnection = new Connection("https://solana-mainnet.g.alchemy.com/v2/alch-demo", "confirmed");
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const balanceLamports = await fallbackConnection.getBalance(pubKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      
      console.log(`Fallback balance: ${balanceSOL} SOL`);
      // Return real balance only - no mock data per user requirement
      return balanceSOL;
    } catch (fallbackError: any) {
      console.error('Fallback balance fetch failed:', fallbackError.message);
      // Return 0 when no real balance can be fetched - no mock data per user requirement
      console.log('No real balance available, returning 0 SOL');
      return 0;
    }
  }
}