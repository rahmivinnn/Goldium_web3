import { PublicKey, Connection, Transaction } from '@solana/web3.js';
import { SOLANA_RPC_URL } from './constants';

// External wallet types that we support
export type ExternalWalletType = 'phantom' | 'solflare' | 'backpack' | 'trust';

// Wallet interface for external wallets
interface ExternalWallet {
  isConnected: boolean;
  publicKey: PublicKey | null;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

// External wallet service for managing multiple wallet connections
export class ExternalWalletService {
  private connection: Connection;
  private currentWallet: ExternalWallet | null = null;
  private currentWalletType: ExternalWalletType | null = null;
  
  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Check if a specific wallet is available
  isWalletAvailable(walletType: ExternalWalletType): boolean {
    if (typeof window === 'undefined') return false;
    
    switch (walletType) {
      case 'phantom':
        return !!(window as any).solana?.isPhantom;
      case 'solflare':
        return !!(window as any).solflare;
      case 'backpack':
        return !!(window as any).backpack;
      case 'trust':
        return !!(window as any).trustWallet;
      default:
        return false;
    }
  }

  // Get available wallets
  getAvailableWallets(): ExternalWalletType[] {
    const available: ExternalWalletType[] = [];
    
    if (this.isWalletAvailable('phantom')) available.push('phantom');
    if (this.isWalletAvailable('solflare')) available.push('solflare');
    if (this.isWalletAvailable('backpack')) available.push('backpack');
    if (this.isWalletAvailable('trust')) available.push('trust');
    
    return available;
  }

  // Connect to a specific wallet
  async connectWallet(walletType: ExternalWalletType): Promise<{ publicKey: PublicKey; address: string }> {
    if (!this.isWalletAvailable(walletType)) {
      throw new Error(`${walletType} wallet is not available`);
    }

    let wallet: ExternalWallet;
    
    switch (walletType) {
      case 'phantom':
        wallet = (window as any).solana;
        break;
      case 'solflare':
        wallet = (window as any).solflare;
        break;
      case 'backpack':
        wallet = (window as any).backpack;
        break;
      case 'trust':
        wallet = (window as any).trustWallet;
        break;
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    try {
      const response = await wallet.connect();
      this.currentWallet = wallet;
      this.currentWalletType = walletType;
      
      return {
        publicKey: response.publicKey,
        address: response.publicKey.toString()
      };
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error);
      throw new Error(`Failed to connect to ${walletType} wallet`);
    }
  }

  // Disconnect current wallet
  async disconnectWallet(): Promise<void> {
    if (this.currentWallet) {
      try {
        await this.currentWallet.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
      
      this.currentWallet = null;
      this.currentWalletType = null;
    }
  }

  // Get current wallet info
  getCurrentWallet(): { wallet: ExternalWallet | null; type: ExternalWalletType | null } {
    return {
      wallet: this.currentWallet,
      type: this.currentWalletType
    };
  }

  // Check if currently connected to an external wallet
  isConnected(): boolean {
    return this.currentWallet?.isConnected || false;
  }

  // Get current public key
  getPublicKey(): PublicKey | null {
    return this.currentWallet?.publicKey || null;
  }

  // Get current address
  getAddress(): string | null {
    const publicKey = this.getPublicKey();
    return publicKey ? publicKey.toString() : null;
  }

  // Get SOL balance for current wallet
  async getBalance(): Promise<number> {
    const publicKey = this.getPublicKey();
    if (!publicKey) return 0;
    
    try {
      const balance = await this.connection.getBalance(publicKey, 'confirmed');
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching external wallet balance:', error);
      return 0;
    }
  }

  // Sign transaction with current wallet
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }
    
    return this.currentWallet.signTransaction(transaction);
  }

  // Sign multiple transactions
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }
    
    return this.currentWallet.signAllTransactions(transactions);
  }
}

// Export singleton instance
export const externalWalletService = new ExternalWalletService();