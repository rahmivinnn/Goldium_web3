import { useWallet } from '@/components/multi-wallet-provider';
import { PublicKey } from '@/lib/solana';
import { useState, useCallback } from 'react';
import { SOLSCAN_BASE_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export function useSolana() {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getSolscanUrl = useCallback((signature: string) => {
    return `${SOLSCAN_BASE_URL}/tx/${signature}`;
  }, []);

  const handleTransaction = useCallback(
    async (
      operation: () => Promise<string>,
      successMessage: string,
      errorMessage: string
    ): Promise<TransactionResult> => {
      if (!publicKey) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet first.",
          variant: "destructive",
        });
        return { signature: '', success: false, error: 'Wallet not connected' };
      }

      setIsLoading(true);
      try {
        // For demo purposes, simulate successful transaction
        // In real implementation, this would call actual Solana transactions
        const signature = 'demo-transaction-' + Date.now();
        
        toast({
          title: "Transaction successful!",
          description: successMessage,
        });

        return { signature, success: true };
      } catch (error) {
        console.error('Transaction error:', error);
        const errorMsg = error instanceof Error ? error.message : errorMessage;
        
        toast({
          title: "Transaction failed",
          description: errorMsg,
          variant: "destructive",
        });

        return { signature: '', success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, toast]
  );

  const sendSol = useCallback(
    async (toAddress: string, amount: number): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use Solana Web3.js
          console.log(`Sending ${amount} SOL to ${toAddress}`);
          return 'demo-sol-send-' + Date.now();
        },
        `Successfully sent ${amount} SOL`,
        'Failed to send SOL'
      );
    },
    [handleTransaction]
  );

  const sendToken = useCallback(
    async (toAddress: string, amount: number): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use SPL Token
          console.log(`Sending ${amount} GOLD to ${toAddress}`);
          return 'demo-token-send-' + Date.now();
        },
        `Successfully sent ${amount} GOLD`,
        'Failed to send GOLD'
      );
    },
    [handleTransaction]
  );

  const swapTokens = useCallback(
    async (
      fromMint: PublicKey,
      toMint: PublicKey,
      amount: number,
      slippage: number
    ): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use Jupiter or Raydium
          console.log(`Swapping ${amount} tokens with ${slippage}% slippage`);
          return 'demo-swap-' + Date.now();
        },
        `Successfully swapped ${amount} tokens`,
        'Failed to swap tokens'
      );
    },
    [handleTransaction]
  );

  const stakeTokens = useCallback(
    async (amount: number): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use staking program
          console.log(`Staking ${amount} GOLD tokens`);
          return 'demo-stake-' + Date.now();
        },
        `Successfully staked ${amount} GOLD`,
        'Failed to stake tokens'
      );
    },
    [handleTransaction]
  );

  const unstakeTokens = useCallback(
    async (amount: number): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use staking program
          console.log(`Unstaking ${amount} GOLD tokens`);
          return 'demo-unstake-' + Date.now();
        },
        `Successfully unstaked ${amount} GOLD`,
        'Failed to unstake tokens'
      );
    },
    [handleTransaction]
  );

  const claimRewards = useCallback(
    async (): Promise<TransactionResult> => {
      return handleTransaction(
        async () => {
          // Demo implementation - real version would use staking program
          console.log('Claiming staking rewards');
          return 'demo-claim-' + Date.now();
        },
        'Successfully claimed rewards',
        'Failed to claim rewards'
      );
    },
    [handleTransaction]
  );

  return {
    connected,
    publicKey,
    isLoading,
    sendSol,
    sendToken,
    swapTokens,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    getSolscanUrl,
  };
}