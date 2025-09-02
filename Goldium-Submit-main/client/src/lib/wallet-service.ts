import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { WALLET_PRIVATE_KEY, SOLANA_RPC_URL, TREASURY_WALLET } from './constants';

// Make Buffer globally available for browser compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

// Self-contained wallet service using the provided private key
export class SelfContainedWallet {
  private keypair: Keypair;
  private connection: Connection;
  
  constructor() {
    // Create keypair from the provided private key
    this.keypair = Keypair.fromSecretKey(WALLET_PRIVATE_KEY);
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Get the public key of the wallet
  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  // Get the wallet address as string
  getAddress(): string {
    return this.keypair.publicKey.toBase58();
  }

  // Get SOL balance from mainnet
  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey, 'confirmed');
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  // Sign and send transaction
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    try {
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.keypair.publicKey;

      // Sign transaction
      transaction.sign(this.keypair);

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair]
      );

      console.log(`Transaction signature: ${signature}`);
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Get connection for additional operations
  getConnection(): Connection {
    return this.connection;
  }

  // Get treasury wallet public key
  getTreasuryWallet(): PublicKey {
    return new PublicKey(TREASURY_WALLET);
  }

  // Check if wallet is connected (always true for self-contained wallet)
  isConnected(): boolean {
    return true;
  }
}

// Create a singleton instance
export const selfContainedWallet = new SelfContainedWallet();

// Export wallet details for use in components
export const walletInfo = {
  address: selfContainedWallet.getAddress(),
  publicKey: selfContainedWallet.getPublicKey(),
  isConnected: true,
  walletType: 'Self-Contained'
};