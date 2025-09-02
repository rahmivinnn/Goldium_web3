import { Connection, PublicKey } from '@solana/web3.js';
import { selfContainedWallet } from './wallet-service';
import { TREASURY_WALLET, SOLSCAN_BASE_URL } from './constants';

export interface TransactionInfo {
  signature: string;
  timestamp: number;
  type: 'swap' | 'stake' | 'unstake' | 'claim' | 'transfer';
  amount: number;
  token: 'SOL' | 'GOLD';
  status: 'confirmed' | 'pending' | 'failed';
  solscanUrl: string;
  memo?: string;
}

class TransactionTracker {
  private connection: Connection;
  private transactions: TransactionInfo[] = [];

  constructor() {
    this.connection = selfContainedWallet.getConnection();
  }

  // Fetch all transactions related to treasury wallet
  async fetchTreasuryTransactions(): Promise<TransactionInfo[]> {
    try {
      console.log('Fetching treasury wallet transactions...');
      
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);
      
      // Get confirmed signatures for treasury wallet
      const signatures = await this.connection.getSignaturesForAddress(
        treasuryPubkey,
        { limit: 50 }
      );
      
      const transactions: TransactionInfo[] = [];
      
      for (const signatureInfo of signatures) {
        try {
          // Get transaction details
          const transaction = await this.connection.getTransaction(
            signatureInfo.signature,
            { commitment: 'confirmed' }
          );
          
          if (transaction) {
            const txInfo: TransactionInfo = {
              signature: signatureInfo.signature,
              timestamp: (signatureInfo.blockTime || 0) * 1000,
              type: this.determineTransactionType(transaction),
              amount: this.extractAmount(transaction),
              token: this.extractToken(transaction),
              status: signatureInfo.err ? 'failed' : 'confirmed',
              solscanUrl: `${SOLSCAN_BASE_URL}/tx/${signatureInfo.signature}`,
              memo: this.extractMemo(transaction)
            };
            
            transactions.push(txInfo);
          }
        } catch (error) {
          console.error(`Error processing transaction ${signatureInfo.signature}:`, error);
        }
      }
      
      this.transactions = transactions;
      return transactions;
      
    } catch (error) {
      console.error('Error fetching treasury transactions:', error);
      return [];
    }
  }

  // Fetch transactions for user wallet
  async fetchUserTransactions(): Promise<TransactionInfo[]> {
    try {
      console.log('Fetching user wallet transactions...');
      
      const userPubkey = selfContainedWallet.getPublicKey();
      
      // Get confirmed signatures for user wallet
      const signatures = await this.connection.getSignaturesForAddress(
        userPubkey,
        { limit: 50 }
      );
      
      const transactions: TransactionInfo[] = [];
      
      for (const signatureInfo of signatures) {
        try {
          const transaction = await this.connection.getTransaction(
            signatureInfo.signature,
            { commitment: 'confirmed' }
          );
          
          if (transaction) {
            const txInfo: TransactionInfo = {
              signature: signatureInfo.signature,
              timestamp: (signatureInfo.blockTime || 0) * 1000,
              type: this.determineTransactionType(transaction),
              amount: this.extractAmount(transaction),
              token: this.extractToken(transaction),
              status: signatureInfo.err ? 'failed' : 'confirmed',
              solscanUrl: `${SOLSCAN_BASE_URL}/tx/${signatureInfo.signature}`,
              memo: this.extractMemo(transaction)
            };
            
            transactions.push(txInfo);
          }
        } catch (error) {
          console.error(`Error processing transaction ${signatureInfo.signature}:`, error);
        }
      }
      
      return transactions;
      
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Determine transaction type from transaction data
  private determineTransactionType(transaction: any): TransactionInfo['type'] {
    // Check memo instructions for type indicators
    const memo = this.extractMemo(transaction);
    
    if (memo) {
      if (memo.includes('STAKE:')) return 'stake';
      if (memo.includes('UNSTAKE:')) return 'unstake';
      if (memo.includes('CLAIM:')) return 'claim';
      if (memo.includes('SWAP:')) return 'swap';
    }
    
    // Default to transfer if no memo found
    return 'transfer';
  }

  // Extract amount from transaction
  private extractAmount(transaction: any): number {
    try {
      // Get the first instruction (usually the main transfer)
      const instruction = transaction?.transaction?.message?.instructions?.[0];
      
      if (instruction) {
        // For system program transfers, extract lamports
        const lamports = instruction?.lamports || 0;
        return lamports / 1e9; // Convert to SOL
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Extract token type from transaction
  private extractToken(transaction: any): 'SOL' | 'GOLD' {
    // Check memo for token type or default to SOL
    const memo = this.extractMemo(transaction);
    
    if (memo && memo.includes('GOLD')) {
      return 'GOLD';
    }
    
    return 'SOL';
  }

  // Extract memo from transaction
  private extractMemo(transaction: any): string | undefined {
    try {
      // Look for memo program instructions
      const instructions = transaction?.transaction?.message?.instructions || [];
      
      for (const instruction of instructions) {
        // Check if this is a memo instruction
        if (instruction?.program === 'memo' || instruction?.programId?.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr') {
          return instruction?.data || instruction?.memo;
        }
      }
      
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Get all transactions (cached)
  getTransactions(): TransactionInfo[] {
    return this.transactions;
  }

  // Add transaction to local cache
  addTransaction(txInfo: TransactionInfo): void {
    this.transactions.unshift(txInfo); // Add to beginning
  }

  // Clear transaction cache
  clearTransactions(): void {
    this.transactions = [];
  }

  // Get transactions filtered by type
  getTransactionsByType(type: TransactionInfo['type']): TransactionInfo[] {
    return this.transactions.filter(tx => tx.type === type);
  }

  // Get transaction by signature
  getTransactionBySignature(signature: string): TransactionInfo | undefined {
    return this.transactions.find(tx => tx.signature === signature);
  }
}

export const transactionTracker = new TransactionTracker();