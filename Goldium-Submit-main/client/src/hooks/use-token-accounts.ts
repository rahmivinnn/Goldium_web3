import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/components/multi-wallet-provider';
import { solanaService } from '@/lib/solana';
import { GOLDIUM_TOKEN_ADDRESS } from '@/lib/constants';
import { PublicKey } from '@/lib/solana';

export interface TokenBalances {
  sol: number;
  gold: number;
  stakedGold: number;
  claimableRewards: number;
}

export function useTokenAccounts() {
  const { publicKey, connected, balance } = useWallet();
  
  console.log('useTokenAccounts - publicKey:', publicKey?.toString(), 'connected:', connected, 'balance:', balance);

  const {
    data: balances,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['token-balances', publicKey?.toString(), balance],
    queryFn: async (): Promise<TokenBalances> => {
      console.log('queryFn called - publicKey:', publicKey?.toString(), 'balance from wallet:', balance);
      
      if (!publicKey) {
        return { sol: 0, gold: 0, stakedGold: 0, claimableRewards: 0 };
      }

      const goldMintAddress = new PublicKey(GOLDIUM_TOKEN_ADDRESS);
      
      // Use balance from wallet provider and fetch GOLD separately
      let goldBalance = 0;
      try {
        goldBalance = await solanaService.getTokenBalance(publicKey, goldMintAddress);
      } catch (error) {
        console.log('No GOLD tokens found or error fetching GOLD balance:', error);
      }

      const result = {
        sol: balance || 0, // Use real-time balance from wallet provider
        gold: goldBalance || 0,
        stakedGold: 0, // Real staked amount from program
        claimableRewards: 0, // Real rewards from program
      };
      
      console.log('Token balances calculated:', result);
      return result;
    },
    enabled: connected && !!publicKey,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000 // Consider data stale after 2 seconds
  });

  // Use direct balance from wallet provider as fallback if query hasn't updated yet
  const finalBalances = balances || { 
    sol: balance || 0, 
    gold: 0, 
    stakedGold: 0, 
    claimableRewards: 0 
  };

  console.log('Final balances returned:', finalBalances);

  return {
    balances: finalBalances,
    isLoading,
    error,
    refetch,
  };
}
