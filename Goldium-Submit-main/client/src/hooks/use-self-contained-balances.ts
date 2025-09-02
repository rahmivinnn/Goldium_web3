import { useQuery } from '@tanstack/react-query';
import { useSolanaWallet } from '@/components/solana-wallet-provider';
import { stakingService } from '@/lib/staking-service';
import { splTokenService } from '@/lib/spl-token-service';

export interface BalanceInfo {
  sol: number;
  gold: number;
  stakedGold: number;
  claimableRewards: number;
}

export function useSelfContainedBalances() {
  const { connected, balance, refreshBalance } = useSolanaWallet();

  // Query for balance information
  const { data: balances = { sol: 0, gold: 0, stakedGold: 0, claimableRewards: 0 }, isLoading, refetch } = useQuery({
    queryKey: ['self-contained-balances'],
    queryFn: async (): Promise<BalanceInfo> => {
      if (!connected) {
        return { sol: 0, gold: 0, stakedGold: 0, claimableRewards: 0 };
      }

      // Get staking info
      const stakeInfo = stakingService.getStakeInfo();
      
      // Get real GOLD balance from SPL token account
      let goldBalance = 0;
      try {
        // Fetch real SPL token balance using the wallet's public key
        // Note: This will be available once GOLD_MINT_ADDRESS is properly configured
        goldBalance = 0; // Will fetch real balance when token mint is available
      } catch (error) {
        console.warn('GOLD balance fetch error:', error);
        goldBalance = 0;
      }
      
      return {
        sol: balance,
        gold: goldBalance,
        stakedGold: stakeInfo.totalStaked,
        claimableRewards: stakeInfo.claimableRewards
      };
    },
    enabled: connected,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000 // Consider data stale after 5 seconds
  });

  return {
    balances,
    isLoading,
    refetch,
    refreshBalance
  };
}