import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
import { useSolanaWallet } from './solana-wallet-provider';
import { useSelfContainedBalances } from '@/hooks/use-self-contained-balances';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useToast } from '@/hooks/use-toast';
import { STAKING_APY, SOLSCAN_BASE_URL } from '@/lib/constants';
import { autoSaveTransaction } from '@/lib/historyUtils';

export function SelfContainedStakingTab() {
  const { connected, stakingService, refreshTransactionHistory, publicKey } = useSolanaWallet();
  const { balances, refetch } = useSelfContainedBalances();
  const externalWallet = useExternalWallets();
  const { toast } = useToast();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  // Stake GOLD tokens
  const handleStake = async () => {
    if (!connected || !stakeAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter an amount to stake",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(stakeAmount);
    const goldBalance = balances.gold || 0; // User's actual GOLD balance only
    if (amount <= 0 || amount > goldBalance) {
      toast({
        title: "Invalid Amount", 
        description: goldBalance === 0 ? 
          "You need GOLD tokens to stake. Get some from the Swap tab first." :
          `Please enter a valid amount (max: ${goldBalance.toFixed(4)} GOLD)`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    
    try {
      console.log(`Executing real stake: ${amount} GOLD tokens`);
      
      const result = await stakingService.stakeGold(amount);
      
      if (result.success && result.signature) {
        setLastTxId(result.signature);

        // Auto-save stake transaction to history
        try {
          const walletAddress = externalWallet.connected ? externalWallet.address : publicKey?.toBase58();

          if (walletAddress) {
            // For stake: amountSOL = 0, amountGOLD = staked amount
            autoSaveTransaction(
              walletAddress,
              result.signature,
              'stake',
              0, // No SOL involved in staking
              amount, // GOLD amount staked
              'success'
            );

            // Refresh transaction history in wallet provider
            refreshTransactionHistory();
          }
        } catch (error) {
          console.error('Failed to auto-save stake transaction:', error);
        }

        setStakeAmount('');

        toast({
          title: "Staking Successful! 🔒",
          description: (
            <div className="space-y-2">
              <p>Your GOLD tokens have been staked!</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${result.signature}`, '_blank')}
                >
                  View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ),
        });

        // Refresh balances after successful stake
        setTimeout(() => refetch(), 2000);
        
      } else {
        throw new Error(result.error || 'Staking failed');
      }
      
    } catch (error: any) {
      console.error('Staking failed:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  // Unstake GOLD tokens
  const handleUnstake = async () => {
    if (!connected || !unstakeAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter an amount to unstake",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(unstakeAmount);
    if (amount <= 0 || amount > balances.stakedGold) {
      toast({
        title: "Invalid Amount", 
        description: `Please enter a valid amount (max: ${balances.stakedGold.toFixed(4)} GOLD)`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    
    try {
      console.log(`Executing real unstake: ${amount} GOLD tokens`);
      
      const result = await stakingService.unstakeGold(amount);
      
      if (result.success && result.signature) {
        setLastTxId(result.signature);

        // Auto-save unstake transaction to history
        try {
          const walletAddress = externalWallet.connected ? externalWallet.address : publicKey?.toBase58();

          if (walletAddress) {
            // For unstake: amountSOL = 0, amountGOLD = unstaked amount
            autoSaveTransaction(
              walletAddress,
              result.signature,
              'unstake',
              0, // No SOL involved in unstaking
              amount, // GOLD amount unstaked
              'success'
            );

            // Refresh transaction history in wallet provider
            refreshTransactionHistory();
          }
        } catch (error) {
          console.error('Failed to auto-save unstake transaction:', error);
        }

        setUnstakeAmount('');

        toast({
          title: "Unstaking Successful! 🔓",
          description: (
            <div className="space-y-2">
              <p>Your GOLD tokens have been unstaked!</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${result.signature}`, '_blank')}
                >
                  View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ),
        });

        setTimeout(() => refetch(), 2000);
        
      } else {
        throw new Error(result.error || 'Unstaking failed');
      }
      
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      toast({
        title: "Unstaking Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  // Claim rewards
  const handleClaimRewards = async () => {
    if (!connected || balances.claimableRewards <= 0) {
      toast({
        title: "No Rewards",
        description: "No claimable rewards available",
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    
    try {
      console.log(`Claiming rewards: ${balances.claimableRewards} GOLD`);
      
      const result = await stakingService.claimRewards();
      
      if (result.success && result.signature) {
        setLastTxId(result.signature);
        
        toast({
          title: "Rewards Claimed! 💰",
          description: (
            <div className="space-y-2">
              <p>Your rewards have been claimed!</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${result.signature}`, '_blank')}
                >
                  View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ),
        });
        
        setTimeout(() => refetch(), 2000);
        
      } else {
        throw new Error(result.error || 'Claiming failed');
      }
      
    } catch (error: any) {
      console.error('Claiming failed:', error);
      toast({
        title: "Claiming Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="max-W-2xl mx-auto space-y-6">
      {/* Wallet Balance Display */}
      {externalWallet.connected && (
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-100">Wallet Balance</h3>
                <p className="text-sm text-yellow-200/70">Connected: {externalWallet.selectedWallet}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">
                  {externalWallet.balance.toFixed(4)} SOL
                </p>
                <p className="text-sm text-yellow-200/70">
                  ≈ ${(externalWallet.balance * 195.5).toFixed(2)} USD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{STAKING_APY}%</p>
            <p className="text-sm text-yellow-200/70">Annual APY</p>
          </CardContent>
        </Card>
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {balances.stakedGold.toFixed(2)}
            </p>
            <p className="text-sm text-yellow-200/70">GOLD Staked</p>
          </CardContent>
        </Card>
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {balances.claimableRewards.toFixed(4)}
            </p>
            <p className="text-sm text-yellow-200/70">Claimable Rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake */}
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center">
              <span className="mr-2 text-yellow-400">🔒</span>
              Stake GOLD
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-yellow-100 mb-2 block">Amount to Stake</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-background border-yellow-400/40 focus:border-yellow-400 text-yellow-100"
                />
                <p className="text-xs text-yellow-200/70 mt-1">
                  Available: {balances.gold.toFixed(4)} GOLD
                </p>
              </div>
              <Button
                className="w-full bg-galaxy-button hover:bg-galaxy-button py-3 font-medium text-white"
                onClick={handleStake}
                disabled={
                  !connected ||
                  !stakeAmount ||
                  Number(stakeAmount) <= 0 ||
                  Number(stakeAmount) > balances.gold ||
                  isStaking
                }
              >
                {isStaking ? 'Staking...' : 'Stake GOLD'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unstake */}
        <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center">
              <span className="mr-2 text-yellow-400">🔓</span>
              Unstake GOLD
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-yellow-100 mb-2 block">Amount to Unstake</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="bg-background border-yellow-400/40 focus:border-yellow-400 text-yellow-100"
                />
                <p className="text-xs text-yellow-200/70 mt-1">
                  Staked: {balances.stakedGold.toFixed(4)} GOLD
                </p>
              </div>
              <Button
                className="w-full bg-galaxy-button hover:bg-galaxy-button py-3 font-medium text-white"
                onClick={handleUnstake}
                disabled={
                  !connected ||
                  !unstakeAmount ||
                  Number(unstakeAmount) <= 0 ||
                  Number(unstakeAmount) > balances.stakedGold ||
                  isStaking
                }
              >
                {isStaking ? 'Unstaking...' : 'Unstake GOLD'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claim Rewards */}
      <Card className="bg-black/70 border-yellow-400/40 hover:border-yellow-400/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-yellow-100">Claimable Rewards</h3>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {balances.claimableRewards.toFixed(4)} GOLD
              </p>
              <p className="text-sm text-yellow-200/70">
                ≈ ${(balances.claimableRewards * 20).toFixed(2)} USD
              </p>
            </div>
            <Button
              className="bg-galaxy-button hover:bg-galaxy-button px-6 py-3 font-semibold text-white transition-all duration-200"
              onClick={handleClaimRewards}
              disabled={!connected || balances.claimableRewards <= 0 || isStaking}
            >
              {isStaking ? 'Claiming...' : 'Claim Rewards'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Transaction */}
      {lastTxId && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 mb-2">Last staking transaction:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${lastTxId}`, '_blank')}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}