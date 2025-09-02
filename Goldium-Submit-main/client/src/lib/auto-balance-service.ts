import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL } from './constants';

export interface AutoBalanceState {
  sol: number;
  gold: number;
  stakedGold: number;
  lastUpdated: number;
  isUpdating: boolean;
  error: string | null;
}

class AutoBalanceService {
  private connection: Connection;
  private state: AutoBalanceState = {
    sol: 0,
    gold: 0,
    stakedGold: 0,
    lastUpdated: 0,
    isUpdating: false,
    error: null
  };
  
  private subscribers: Set<(state: AutoBalanceState) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Subscribe to balance updates
  subscribe(callback: (state: AutoBalanceState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Auto-update balances
  startAutoUpdate(walletAddress: string, intervalMs: number = 5000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.updateBalances(walletAddress);
    }, intervalMs);

    // Initial update
    this.updateBalances(walletAddress);
  }

  // Stop auto-update
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Update all balances
  private async updateBalances(walletAddress: string): Promise<void> {
    if (this.state.isUpdating) return;

    this.state.isUpdating = true;
    this.state.error = null;

    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Update SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      this.state.sol = solBalance / LAMPORTS_PER_SOL;

      // Update GOLD balance (placeholder for now)
      // In real implementation, this would fetch from SPL token account
      this.state.gold = 0; // Will be implemented with real token mint

      // Update staked GOLD (placeholder for now)
      this.state.stakedGold = 0; // Will be implemented with staking program

      this.state.lastUpdated = Date.now();
      
      console.log('🔄 Auto-balance updated:', {
        sol: this.state.sol,
        gold: this.state.gold,
        stakedGold: this.state.stakedGold
      });

    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Auto-balance update failed:', error);
    } finally {
      this.state.isUpdating = false;
      this.notifySubscribers();
    }
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Get current state
  getState(): AutoBalanceState {
    return { ...this.state };
  }

  // Manual balance update
  async manualUpdate(walletAddress: string): Promise<void> {
    await this.updateBalances(walletAddress);
  }

  // Auto-optimize balance display
  getOptimizedBalance(token: 'SOL' | 'GOLD'): string {
    const balance = token === 'SOL' ? this.state.sol : this.state.gold;
    
    if (balance === 0) return '0.0000';
    if (balance < 0.0001) return balance.toFixed(8);
    if (balance < 1) return balance.toFixed(4);
    if (balance < 1000) return balance.toFixed(2);
    return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // Auto-detect balance issues
  detectBalanceIssues(): string[] {
    const issues: string[] = [];
    
    if (this.state.sol < 0.001) {
      issues.push('Low SOL balance - may not cover transaction fees');
    }
    
    if (this.state.gold === 0) {
      issues.push('No GOLD tokens - consider swapping SOL to GOLD first');
    }
    
    if (this.state.error) {
      issues.push(`Balance update error: ${this.state.error}`);
    }
    
    return issues;
  }

  // Auto-suggest optimal swap amounts
  getOptimalSwapAmount(fromToken: 'SOL' | 'GOLD'): number {
    const balance = fromToken === 'SOL' ? this.state.sol : this.state.gold;
    const feeBuffer = fromToken === 'SOL' ? 0.001 : 0;
    
    if (balance <= feeBuffer) return 0;
    
    // Suggest 10% of available balance, but not more than 90% of total
    const availableBalance = balance - feeBuffer;
    const suggestedAmount = Math.min(availableBalance * 0.1, availableBalance * 0.9);
    
    return Math.max(0, suggestedAmount);
  }
}

// Export singleton instance
export const autoBalanceService = new AutoBalanceService(); 