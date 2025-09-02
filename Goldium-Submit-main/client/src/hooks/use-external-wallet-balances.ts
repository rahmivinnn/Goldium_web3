import { useQuery } from '@tanstack/react-query';
import { useExternalWallets } from './use-external-wallets';
import { stakingService } from '@/lib/staking-service';
import { splTokenService } from '@/lib/spl-token-service';

export function useExternalWalletBalances() {
  const wallet = useExternalWallets();

  return useQuery({
    queryKey: ['external-wallet-balances', wallet.address],
    queryFn: async () => {
      // Always return default values first
      const defaultBalances = {
        sol: 0,
        gold: 0,
        stakedGold: 0,
        claimableRewards: 0,
      };

      if (!wallet.connected || !wallet.publicKey) {
        return defaultBalances;
      }

      console.log('Fetching balances for external wallet:', wallet.address);

      // Get SOL balance (already available from wallet hook)
      const solBalance = wallet.balance;

      // Get staking info
      const stakeInfo = stakingService.getStakeInfo();
      
      // Get real GOLD balance from SPL token account
      let goldBalance = 0;
      try {
        // Fetch real SPL token balance using the wallet's public key
        goldBalance = await splTokenService.getGoldBalance(wallet.publicKey);
      } catch (error) {
        console.warn('GOLD balance fetch error:', error);
        goldBalance = 0;
      }
      
      return {
        sol: solBalance || 0,
        gold: goldBalance || 0,
        stakedGold: stakeInfo?.totalStaked || 0,
        claimableRewards: stakeInfo?.claimableRewards || 0,
      };
    },
    enabled: true, // Always enable, not just when connected
    refetchInterval: 1000, // Refetch every 1 second for instant updates when switching wallets
    staleTime: 500, // Consider data stale after 0.5 seconds for instant refresh
    initialData: {
      sol: 0,
      gold: 0,
      stakedGold: 0,
      claimableRewards: 0,
    },
  });
}