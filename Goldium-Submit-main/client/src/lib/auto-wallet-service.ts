import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_RPC_URL } from './constants';

export interface AutoWalletState {
  connected: boolean;
  connecting: boolean;
  walletType: 'phantom' | 'solflare' | 'trustwallet' | 'self-contained' | null;
  address: string | null;
  balance: number;
  lastUpdated: number;
  error: string | null;
}

export interface WalletInfo {
  type: string;
  name: string;
  icon: string;
  available: boolean;
  connected: boolean;
}

class AutoWalletService {
  private connection: Connection;
  private state: AutoWalletState = {
    connected: false,
    connecting: false,
    walletType: null,
    address: null,
    balance: 0,
    lastUpdated: 0,
    error: null
  };
  
  private subscribers: Set<(state: AutoWalletState) => void> = new Set();
  private balanceInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Subscribe to wallet state changes
  subscribe(callback: (state: AutoWalletState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Auto-detect available wallets
  async autoDetectWallets(): Promise<WalletInfo[]> {
    const wallets: WalletInfo[] = [
      {
        type: 'phantom',
        name: 'Phantom',
        icon: '👻',
        available: false,
        connected: false
      },
      {
        type: 'solflare',
        name: 'Solflare',
        icon: '🔥',
        available: false,
        connected: false
      },
      {
        type: 'trustwallet',
        name: 'Trust Wallet',
        icon: '🛡️',
        available: false,
        connected: false
      }
    ];

    // Check availability
    wallets.forEach(wallet => {
      const walletProvider = (window as any)[wallet.type]?.solana;
      wallet.available = !!walletProvider;
      wallet.connected = !!(walletProvider?.isConnected);
    });

    return wallets.filter(wallet => wallet.available);
  }

  // Auto-connect to best available wallet
  async autoConnectBestWallet(): Promise<boolean> {
    try {
      this.state.connecting = true;
      this.state.error = null;
      this.notifySubscribers();

      const availableWallets = await this.autoDetectWallets();
      
      if (availableWallets.length === 0) {
        throw new Error('No wallet extensions found. Please install Phantom, Solflare, or Trust Wallet.');
      }

      // Try to connect to the first available wallet
      const bestWallet = availableWallets[0];
      console.log(`🔄 Auto-connecting to ${bestWallet.name}...`);
      
      const success = await this.connectToWallet(bestWallet.type);
      
      if (success) {
        console.log(`✅ Auto-connected to ${bestWallet.name}`);
        return true;
      } else {
        throw new Error(`Failed to connect to ${bestWallet.name}`);
      }

    } catch (error: any) {
      this.state.error = error.message;
      console.error('Auto-connect failed:', error);
      return false;
    } finally {
      this.state.connecting = false;
      this.notifySubscribers();
    }
  }

  // Connect to specific wallet
  async connectToWallet(walletType: string): Promise<boolean> {
    try {
      const walletProvider = (window as any)[walletType]?.solana;
      
      if (!walletProvider) {
        throw new Error(`${walletType} wallet not found`);
      }

      // Request connection
      const response = await walletProvider.connect();
      
      if (response.publicKey) {
        this.state.connected = true;
        this.state.walletType = walletType as any;
        this.state.address = response.publicKey.toString();
        this.state.lastUpdated = Date.now();
        
        // Start auto-balance updates
        this.startAutoBalanceUpdate();
        
        // Listen for wallet events
        this.setupWalletListeners(walletProvider);
        
        console.log(`✅ Connected to ${walletType}: ${this.state.address}`);
        return true;
      } else {
        throw new Error('Connection rejected by user');
      }

    } catch (error: any) {
      this.state.error = error.message;
      console.error(`Failed to connect to ${walletType}:`, error);
      return false;
    }
  }

  // Auto-disconnect
  async autoDisconnect(): Promise<void> {
    try {
      if (this.state.walletType && this.state.walletType !== 'self-contained') {
        const walletProvider = (window as any)[this.state.walletType]?.solana;
        if (walletProvider) {
          await walletProvider.disconnect();
        }
      }

      this.state.connected = false;
      this.state.walletType = null;
      this.state.address = null;
      this.state.balance = 0;
      this.state.error = null;
      
      this.stopAutoBalanceUpdate();
      
      console.log('✅ Wallet disconnected');
      
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      this.notifySubscribers();
    }
  }

  // Start auto-balance updates
  private startAutoBalanceUpdate(): void {
    this.stopAutoBalanceUpdate();
    
    this.balanceInterval = setInterval(async () => {
      if (this.state.connected && this.state.address) {
        await this.updateBalance();
      }
    }, 5000); // Update every 5 seconds
    
    // Initial update
    this.updateBalance();
  }

  // Stop auto-balance updates
  private stopAutoBalanceUpdate(): void {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval);
      this.balanceInterval = null;
    }
  }

  // Update balance
  private async updateBalance(): Promise<void> {
    if (!this.state.address) return;

    try {
      const publicKey = new PublicKey(this.state.address);
      const lamports = await this.connection.getBalance(publicKey);
      const balance = lamports / 1e9; // Convert to SOL
      
      this.state.balance = balance;
      this.state.lastUpdated = Date.now();
      
      console.log(`💰 Balance updated: ${balance.toFixed(6)} SOL`);
      
    } catch (error) {
      console.error('Balance update failed:', error);
      this.state.error = 'Failed to update balance';
    } finally {
      this.notifySubscribers();
    }
  }

  // Setup wallet event listeners
  private setupWalletListeners(walletProvider: any): void {
    // Listen for account changes
    walletProvider.on('accountChanged', (publicKey: PublicKey | null) => {
      if (publicKey) {
        this.state.address = publicKey.toString();
        this.updateBalance();
      } else {
        this.autoDisconnect();
      }
    });

    // Listen for disconnect
    walletProvider.on('disconnect', () => {
      this.autoDisconnect();
    });

    // Listen for connection
    walletProvider.on('connect', (publicKey: PublicKey) => {
      this.state.address = publicKey.toString();
      this.updateBalance();
    });
  }

  // Auto-switch to better wallet if available
  async autoSwitchToBetterWallet(): Promise<boolean> {
    try {
      const availableWallets = await this.autoDetectWallets();
      
      if (availableWallets.length === 0) {
        return false;
      }

      // If no wallet is connected, connect to the first available
      if (!this.state.connected) {
        return await this.autoConnectBestWallet();
      }

      // If current wallet is not the best option, switch
      const currentWallet = availableWallets.find(w => w.type === this.state.walletType);
      const bestWallet = availableWallets[0];
      
      if (currentWallet && bestWallet.type !== this.state.walletType) {
        console.log(`🔄 Auto-switching from ${currentWallet.name} to ${bestWallet.name}...`);
        
        await this.autoDisconnect();
        return await this.connectToWallet(bestWallet.type);
      }

      return true;

    } catch (error) {
      console.error('Auto-switch failed:', error);
      return false;
    }
  }

  // Get current state
  getState(): AutoWalletState {
    return { ...this.state };
  }

  // Check if wallet is healthy
  isWalletHealthy(): boolean {
    return this.state.connected && 
           this.state.address && 
           !this.state.error && 
           (Date.now() - this.state.lastUpdated) < 30000; // 30 seconds
  }

  // Auto-reconnect if needed
  async autoReconnectIfNeeded(): Promise<boolean> {
    if (!this.isWalletHealthy() && this.state.walletType) {
      console.log('🔄 Auto-reconnecting wallet...');
      return await this.connectToWallet(this.state.walletType);
    }
    return true;
  }

  // Notify subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Auto-cleanup
  cleanup(): void {
    this.stopAutoBalanceUpdate();
    this.subscribers.clear();
  }
}

// Export singleton instance
export const autoWalletService = new AutoWalletService(); 