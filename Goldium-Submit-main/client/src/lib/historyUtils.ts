// Enhanced transaction history utilities for Goldium DeFi dApp
// Implements auto-save transaction history per wallet address to localStorage

export interface GoldiumTransactionHistory {
  txId: string;
  type: 'swap' | 'stake' | 'unstake' | 'send';
  timestamp: Date;
  amountSOL: number;
  amountGOLD: number;
  status: 'success' | 'failed';
  solscanLink: string;
}

/**
 * Save transaction history to localStorage for specific wallet
 * Key format: goldium_history_${walletAddress}
 */
export const saveTransactionHistory = (walletAddress: string, newTx: GoldiumTransactionHistory): void => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided - transaction not saved');
    return;
  }

  try {
    const key = `goldium_history_${walletAddress}`;
    let history: GoldiumTransactionHistory[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Convert timestamp to Date object if it's a string
    const txWithDateTimestamp = {
      ...newTx,
      timestamp: new Date(newTx.timestamp)
    };
    
    // Add new transaction to beginning of array (newest first)
    history.unshift(txWithDateTimestamp);
    
    // Keep only last 100 transactions to prevent localStorage bloat
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(history));
    
    console.log(`💾 Auto-saved transaction to wallet ${walletAddress.slice(0, 8)}... (${history.length} total transactions)`);
  } catch (error) {
    console.error('❌ Error saving transaction history:', error);
  }
};

/**
 * Load transaction history from localStorage for specific wallet
 * Returns empty array if no history found
 */
export const loadTransactionHistory = (walletAddress: string): GoldiumTransactionHistory[] => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided - returning empty history');
    return [];
  }

  try {
    const key = `goldium_history_${walletAddress}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      console.log(`📋 No transaction history found for wallet ${walletAddress.slice(0, 8)}...`);
      return [];
    }
    
    const history: GoldiumTransactionHistory[] = JSON.parse(stored);
    
    // Convert timestamp strings back to Date objects
    const historyWithDates = history.map(tx => ({
      ...tx,
      timestamp: new Date(tx.timestamp)
    }));
    
    console.log(`📚 Loaded ${historyWithDates.length} transactions for wallet ${walletAddress.slice(0, 8)}...`);
    return historyWithDates;
    
  } catch (error) {
    console.error('❌ Error loading transaction history:', error);
    return [];
  }
};

/**
 * Clear transaction history for specific wallet
 */
export const clearTransactionHistory = (walletAddress: string): void => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided - cannot clear history');
    return;
  }

  try {
    const key = `goldium_history_${walletAddress}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Cleared transaction history for wallet ${walletAddress.slice(0, 8)}...`);
  } catch (error) {
    console.error('❌ Error clearing transaction history:', error);
  }
};

/**
 * Get transaction count for specific wallet
 */
export const getTransactionCount = (walletAddress: string): number => {
  if (!walletAddress) return 0;
  
  try {
    const key = `goldium_history_${walletAddress}`;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    
    const history: GoldiumTransactionHistory[] = JSON.parse(stored);
    return history.length;
  } catch (error) {
    console.error('❌ Error getting transaction count:', error);
    return 0;
  }
};

/**
 * Get recent transactions (last N) for specific wallet
 */
export const getRecentTransactions = (walletAddress: string, count: number = 10): GoldiumTransactionHistory[] => {
  const history = loadTransactionHistory(walletAddress);
  return history.slice(0, count);
};

/**
 * Get transactions by type for specific wallet
 */
export const getTransactionsByType = (walletAddress: string, type: GoldiumTransactionHistory['type']): GoldiumTransactionHistory[] => {
  const history = loadTransactionHistory(walletAddress);
  return history.filter(tx => tx.type === type);
};

/**
 * Helper function to create transaction entry with proper format
 */
export const createTransactionEntry = (
  txId: string,
  type: GoldiumTransactionHistory['type'],
  amountSOL: number,
  amountGOLD: number,
  status: 'success' | 'failed' = 'success'
): GoldiumTransactionHistory => {
  return {
    txId,
    type,
    timestamp: new Date(),
    amountSOL,
    amountGOLD,
    status,
    solscanLink: `https://solscan.io/tx/${txId}`
  };
};

/**
 * Auto-save transaction after successful operation
 * This is the main function to call after swap/stake/unstake/send operations
 */
export const autoSaveTransaction = (
  walletAddress: string,
  txId: string,
  type: GoldiumTransactionHistory['type'],
  amountSOL: number,
  amountGOLD: number,
  status: 'success' | 'failed' = 'success'
): void => {
  if (!walletAddress || !txId) {
    console.warn('⚠️ Missing wallet address or transaction ID - cannot auto-save');
    return;
  }

  const transaction = createTransactionEntry(txId, type, amountSOL, amountGOLD, status);
  saveTransactionHistory(walletAddress, transaction);
  
  console.log(`✅ Auto-saved ${type} transaction: ${amountSOL} SOL / ${amountGOLD} GOLD`);
};
