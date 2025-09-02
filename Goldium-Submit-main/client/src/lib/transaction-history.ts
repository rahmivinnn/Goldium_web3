import { SwapMetadata } from './swap-service';

// Enhanced transaction record matching user requirements
export interface TransactionRecord {
  id: string;
  type: 'swap' | 'send' | 'stake' | 'unstake';
  signature: string;
  timestamp: number;
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
  recipientAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  txUrl: string;
}

// New interface matching user's exact requirements
export interface GoldiumTransactionHistory {
  txId: string;
  type: 'swap' | 'stake' | 'unstake' | 'send';
  timestamp: Date;
  amountSOL: number;
  amountGOLD: number;
  status: 'success' | 'failed';
  solscanLink: string;
}

interface WalletTransactionData {
  transactions: TransactionRecord[];
  goldBalance: number;
  stakedGoldBalance: number;
}

class TransactionHistoryManager {
  private static instance: TransactionHistoryManager;
  private currentWallet: string | null = null;
  private walletData: Map<string, WalletTransactionData> = new Map();

  static getInstance(): TransactionHistoryManager {
    if (!TransactionHistoryManager.instance) {
      TransactionHistoryManager.instance = new TransactionHistoryManager();
    }
    return TransactionHistoryManager.instance;
  }

  // Set current active wallet
  setCurrentWallet(walletAddress: string | null): void {
    this.currentWallet = walletAddress;
    if (walletAddress) {
      this.loadWalletData(walletAddress);
      console.log(`📱 Switched to wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}`);
    } else {
      console.log(`📱 No wallet connected`);
    }
  }

  // Load wallet data from localStorage
  private loadWalletData(walletAddress: string): void {
    if (this.walletData.has(walletAddress)) return;

    try {
      const stored = localStorage.getItem(`goldium_wallet_${walletAddress}`);
      if (stored) {
        const data: WalletTransactionData = JSON.parse(stored);
        this.walletData.set(walletAddress, data);
        console.log(`📚 Loaded ${data.transactions.length} transactions for wallet ${walletAddress.slice(0, 8)}...`);
      } else {
        // Initialize empty wallet data
        this.walletData.set(walletAddress, {
          transactions: [],
          goldBalance: 0,
          stakedGoldBalance: 0
        });
        console.log(`🆕 Initialized new wallet data for ${walletAddress.slice(0, 8)}...`);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      this.walletData.set(walletAddress, {
        transactions: [],
        goldBalance: 0,
        stakedGoldBalance: 0
      });
    }
  }

  // Save wallet data to localStorage
  private saveWalletData(walletAddress: string): void {
    const data = this.walletData.get(walletAddress);
    if (!data) return;

    try {
      localStorage.setItem(`goldium_wallet_${walletAddress}`, JSON.stringify(data));
      console.log(`💾 Saved wallet data for ${walletAddress.slice(0, 8)}... (${data.transactions.length} transactions)`);
    } catch (error) {
      console.error('Failed to save wallet data:', error);
    }
  }

  // Get current wallet data
  private getCurrentWalletData(): WalletTransactionData | null {
    if (!this.currentWallet) return null;
    return this.walletData.get(this.currentWallet) || null;
  }

  // Add transaction to current wallet's history
  addTransaction(transaction: Omit<TransactionRecord, 'id' | 'txUrl'>): void {
    if (!this.currentWallet) {
      console.warn('⚠️ No wallet connected - transaction not saved');
      return;
    }

    const walletData = this.getCurrentWalletData();
    if (!walletData) return;

    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const txUrl = `https://solscan.io/tx/${transaction.signature}`;
    
    const fullTransaction: TransactionRecord = {
      ...transaction,
      id,
      txUrl
    };

    walletData.transactions.unshift(fullTransaction); // Add to beginning for newest first
    
    // Update GOLD balances based on transaction
    this.updateBalancesFromTransaction(fullTransaction, walletData);
    
    // Save to localStorage
    this.saveWalletData(this.currentWallet);
    
    console.log(`📋 Transaction added to wallet ${this.currentWallet.slice(0, 8)}...: ${transaction.type} - ${transaction.signature}`);
  }

  // Update GOLD balances based on transaction for specific wallet
  private updateBalancesFromTransaction(transaction: TransactionRecord, walletData: WalletTransactionData): void {
    if (transaction.status !== 'confirmed') return;

    switch (transaction.type) {
      case 'swap':
        if (transaction.toToken === 'GOLD' && transaction.toAmount) {
          walletData.goldBalance += transaction.toAmount;
          console.log(`✅ GOLD balance increased by ${transaction.toAmount} from swap (Total: ${walletData.goldBalance})`);
        }
        break;
      
      case 'send':
        if (transaction.fromToken === 'GOLD' && transaction.fromAmount) {
          walletData.goldBalance -= transaction.fromAmount;
          console.log(`📤 GOLD balance decreased by ${transaction.fromAmount} from send (Total: ${walletData.goldBalance})`);
        }
        break;
      
      case 'stake':
        if (transaction.fromToken === 'GOLD' && transaction.fromAmount) {
          walletData.goldBalance -= transaction.fromAmount;
          walletData.stakedGoldBalance += transaction.fromAmount;
          console.log(`🔒 GOLD staked: ${transaction.fromAmount} (Balance: ${walletData.goldBalance}, Staked: ${walletData.stakedGoldBalance})`);
        }
        break;
      
      case 'unstake':
        if (transaction.toToken === 'GOLD' && transaction.toAmount) {
          walletData.stakedGoldBalance -= transaction.toAmount;
          walletData.goldBalance += transaction.toAmount;
          console.log(`🔓 GOLD unstaked: ${transaction.toAmount} (Balance: ${walletData.goldBalance}, Staked: ${walletData.stakedGoldBalance})`);
        }
        break;
    }
  }

  // Get all transactions for current wallet
  getTransactions(): TransactionRecord[] {
    const walletData = this.getCurrentWalletData();
    return walletData ? [...walletData.transactions] : [];
  }

  // Get GOLD balance for current wallet
  getGoldBalance(): number {
    const walletData = this.getCurrentWalletData();
    return walletData ? walletData.goldBalance : 0;
  }

  // Get staked GOLD balance for current wallet
  getStakedGoldBalance(): number {
    const walletData = this.getCurrentWalletData();
    return walletData ? walletData.stakedGoldBalance : 0;
  }

  // Update transaction status for current wallet
  updateTransactionStatus(signature: string, status: 'confirmed' | 'failed'): void {
    if (!this.currentWallet) return;
    
    const walletData = this.getCurrentWalletData();
    if (!walletData) return;

    const transaction = walletData.transactions.find(tx => tx.signature === signature);
    if (transaction) {
      transaction.status = status;
      if (status === 'confirmed') {
        this.updateBalancesFromTransaction(transaction, walletData);
      }
      
      // Save updated data
      this.saveWalletData(this.currentWallet);
      console.log(`📝 Transaction ${signature} status updated to: ${status}`);
    }
  }

  // Clear history for current wallet (for testing/reset)
  clearHistory(): void {
    if (!this.currentWallet) return;
    
    const walletData = this.getCurrentWalletData();
    if (walletData) {
      walletData.transactions = [];
      walletData.goldBalance = 0;
      walletData.stakedGoldBalance = 0;
      this.saveWalletData(this.currentWallet);
      console.log(`🗑️ Transaction history cleared for wallet ${this.currentWallet.slice(0, 8)}...`);
    }
  }

  // Get transactions by type for current wallet
  getTransactionsByType(type: TransactionRecord['type']): TransactionRecord[] {
    const walletData = this.getCurrentWalletData();
    return walletData ? walletData.transactions.filter((tx: TransactionRecord) => tx.type === type) : [];
  }

  // Get recent transactions (last 10) for current wallet
  getRecentTransactions(): TransactionRecord[] {
    const walletData = this.getCurrentWalletData();
    return walletData ? walletData.transactions.slice(0, 10) : [];
  }

  // Get all connected wallets
  getConnectedWallets(): string[] {
    return Array.from(this.walletData.keys());
  }

  // Get wallet stats
  getWalletStats(walletAddress: string): { transactionCount: number; goldBalance: number; stakedGold: number } | null {
    const data = this.walletData.get(walletAddress);
    if (!data) return null;
    
    return {
      transactionCount: data.transactions.length,
      goldBalance: data.goldBalance,
      stakedGold: data.stakedGoldBalance
    };
  }

  // Simplified method to add GOLD transactions (for swap updates)
  addGoldTransaction(type: 'swap_receive' | 'swap_send' | 'stake' | 'unstake', amount: number, signature: string): void {
    if (!this.currentWallet) {
      console.warn('⚠️ No wallet connected - GOLD transaction not saved');
      return;
    }

    const walletData = this.getCurrentWalletData();
    if (!walletData) return;

    // Directly update GOLD balance
    if (type === 'swap_receive') {
      walletData.goldBalance += Math.abs(amount);
      console.log(`🪙 GOLD balance increased: +${Math.abs(amount)} (Total: ${walletData.goldBalance})`);
    } else if (type === 'swap_send') {
      walletData.goldBalance -= Math.abs(amount);
      console.log(`🪙 GOLD balance decreased: -${Math.abs(amount)} (Total: ${walletData.goldBalance})`);
    } else if (type === 'stake') {
      walletData.goldBalance -= Math.abs(amount);
      walletData.stakedGoldBalance += Math.abs(amount);
      console.log(`🔒 GOLD staked: ${Math.abs(amount)} (Balance: ${walletData.goldBalance}, Staked: ${walletData.stakedGoldBalance})`);
    } else if (type === 'unstake') {
      walletData.stakedGoldBalance -= Math.abs(amount);
      walletData.goldBalance += Math.abs(amount);
      console.log(`🔓 GOLD unstaked: ${Math.abs(amount)} (Balance: ${walletData.goldBalance}, Staked: ${walletData.stakedGoldBalance})`);
    }

    // Ensure balances don't go negative
    walletData.goldBalance = Math.max(0, walletData.goldBalance);
    walletData.stakedGoldBalance = Math.max(0, walletData.stakedGoldBalance);

    // Save to localStorage
    this.saveWalletData(this.currentWallet);
  }
}

export const transactionHistory = TransactionHistoryManager.getInstance();