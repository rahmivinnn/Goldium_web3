import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL } from './constants';

export interface AutoTransactionConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  autoConfirm: boolean;
}

export interface AutoTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  retries: number;
  duration: number;
}

export interface TransactionMetadata {
  type: 'swap' | 'stake' | 'unstake' | 'send';
  fromToken: string;
  toToken: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
}

class AutoTransactionService {
  private connection: Connection;
  private config: AutoTransactionConfig = {
    maxRetries: 3,
    retryDelay: 2000,
    timeout: 30000,
    autoConfirm: true
  };
  
  private pendingTransactions: Map<string, TransactionMetadata> = new Map();
  private subscribers: Set<(metadata: TransactionMetadata) => void> = new Set();

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Configure auto-transaction settings
  configure(config: Partial<AutoTransactionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Subscribe to transaction updates
  subscribe(callback: (metadata: TransactionMetadata) => void): () => void {
    this.subscribers.add(callback);
    
    // Send all pending transactions
    Array.from(this.pendingTransactions.values()).forEach(metadata => {
      callback(metadata);
    });
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Auto-process transaction with retries
  async autoProcessTransaction(
    transaction: Transaction,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    metadata: Omit<TransactionMetadata, 'timestamp' | 'status' | 'signature' | 'error'>
  ): Promise<AutoTransactionResult> {
    const startTime = Date.now();
    const transactionId = `${metadata.type}-${Date.now()}-${Math.random()}`;
    
    // Create transaction metadata
    const txMetadata: TransactionMetadata = {
      ...metadata,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.pendingTransactions.set(transactionId, txMetadata);
    this.notifySubscribers(txMetadata);

    let retries = 0;
    let lastError: string = '';

    while (retries <= this.config.maxRetries) {
      try {
        console.log(`🔄 Processing transaction (attempt ${retries + 1}/${this.config.maxRetries + 1}):`, metadata.type);
        
        // Sign transaction
        const signedTransaction = await signTransaction(transaction);
        
        // Send transaction with timeout
        const signature = await Promise.race([
          this.connection.sendRawTransaction(signedTransaction.serialize()),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), this.config.timeout)
          )
        ]);

        // Update metadata
        txMetadata.status = 'confirmed';
        txMetadata.signature = signature;
        this.pendingTransactions.set(transactionId, txMetadata);
        this.notifySubscribers(txMetadata);

        // Auto-confirm transaction if enabled
        if (this.config.autoConfirm) {
          await this.autoConfirmTransaction(signature);
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Transaction successful: ${signature} (${duration}ms)`);

        return {
          success: true,
          signature,
          retries,
          duration
        };

      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        retries++;
        
        console.error(`❌ Transaction failed (attempt ${retries}/${this.config.maxRetries + 1}):`, lastError);
        
        // Update metadata with error
        txMetadata.status = 'failed';
        txMetadata.error = lastError;
        this.pendingTransactions.set(transactionId, txMetadata);
        this.notifySubscribers(txMetadata);

        if (retries <= this.config.maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retries));
        }
      }
    }

    const duration = Date.now() - startTime;
    console.error(`💥 Transaction failed after ${retries} attempts:`, lastError);

    return {
      success: false,
      error: lastError,
      retries,
      duration
    };
  }

  // Auto-confirm transaction
  private async autoConfirmTransaction(signature: string): Promise<void> {
    try {
      console.log('🔄 Auto-confirming transaction...');
      
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction confirmation failed: ${confirmation.value.err}`);
      }
      
      console.log('✅ Transaction confirmed successfully');
      
    } catch (error) {
      console.error('❌ Transaction confirmation failed:', error);
      // Don't throw - confirmation failure doesn't mean transaction failed
    }
  }

  // Auto-validate transaction before sending
  async autoValidateTransaction(
    transaction: Transaction,
    fromBalance: number,
    toBalance: number,
    amount: number
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check transaction fee
    const fee = transaction.instructions.reduce((total, instruction) => {
      return total + (instruction.programId.equals(PublicKey.default) ? 5000 : 0);
    }, 0) / LAMPORTS_PER_SOL;
    
    if (fromBalance < amount + fee) {
      issues.push(`Insufficient balance: need ${(amount + fee).toFixed(6)} SOL, have ${fromBalance.toFixed(6)} SOL`);
    }
    
    // Check transaction size
    const serializedSize = transaction.serialize().length;
    if (serializedSize > 1232) {
      issues.push(`Transaction too large: ${serializedSize} bytes (max 1232)`);
    }
    
    // Check for recent blockhash
    if (!transaction.recentBlockhash) {
      issues.push('Missing recent blockhash');
    }
    
    // Check for valid fee payer
    if (!transaction.feePayer) {
      issues.push('Missing fee payer');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Auto-estimate transaction fee
  async autoEstimateFee(transaction: Transaction): Promise<number> {
    try {
      const fee = await this.connection.getFeeForMessage(
        transaction.compileMessage(),
        'confirmed'
      );
      
      return (fee.value || 5000) / LAMPORTS_PER_SOL;
    } catch (error) {
      console.warn('Failed to estimate fee, using default:', error);
      return 0.000005; // Default fee estimate
    }
  }

  // Auto-optimize transaction
  async autoOptimizeTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      
      // Set fee payer if not set
      if (!transaction.feePayer && transaction.instructions.length > 0) {
        const firstInstruction = transaction.instructions[0];
        if (firstInstruction.keys && firstInstruction.keys.length > 0) {
          transaction.feePayer = firstInstruction.keys[0].pubkey;
        }
      }
      
      return transaction;
    } catch (error) {
      console.error('Failed to optimize transaction:', error);
      return transaction;
    }
  }

  // Get transaction status
  getTransactionStatus(signature: string): TransactionMetadata | null {
    for (const [_, metadata] of this.pendingTransactions) {
      if (metadata.signature === signature) {
        return metadata;
      }
    }
    return null;
  }

  // Get all pending transactions
  getPendingTransactions(): TransactionMetadata[] {
    return Array.from(this.pendingTransactions.values());
  }

  // Clear completed transactions
  clearCompletedTransactions(): void {
    const keysToDelete: string[] = [];
    this.pendingTransactions.forEach((metadata, id) => {
      if (metadata.status === 'confirmed' || metadata.status === 'failed') {
        keysToDelete.push(id);
      }
    });
    
    keysToDelete.forEach(id => {
      this.pendingTransactions.delete(id);
    });
  }

  // Notify subscribers
  private notifySubscribers(metadata: TransactionMetadata): void {
    this.subscribers.forEach(callback => {
      try {
        callback(metadata);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Auto-cleanup old transactions
  startAutoCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      const keysToDelete: string[] = [];
      
      this.pendingTransactions.forEach((metadata, id) => {
        if (metadata.timestamp < cutoffTime) {
          keysToDelete.push(id);
        }
      });
      
      keysToDelete.forEach(id => {
        this.pendingTransactions.delete(id);
      });
    }, intervalMs);
  }
}

// Export singleton instance
export const autoTransactionService = new AutoTransactionService(); 