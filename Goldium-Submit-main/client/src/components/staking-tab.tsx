import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokenAccounts } from '@/hooks/use-token-accounts';
import { useWallet } from '@/components/multi-wallet-provider';
import { solanaService } from '@/lib/solana';
import { STAKING_APY, SOLSCAN_BASE_URL } from '@/lib/constants';
import { autoSaveTransaction } from '@/lib/historyUtils';

export function StakingTab() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  
  const { connected, wallet, publicKey } = useWallet();
  const { balances, refetch } = useTokenAccounts();
  const { toast } = useToast();

  const handleStake = async () => {
    if (!connected || !wallet || !stakeAmount) {
      toast({
        title: "Connection Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(stakeAmount);
    if (amount <= 0 || amount > balances.gold) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid amount (max: ${balances.gold.toFixed(4)} GOLD)`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    
    try {
      console.log(`Executing real stake: ${amount} GOLD tokens`);
      
      const txId = await solanaService.executeStake(amount, wallet);
      
      setLastTxId(txId);

      // Auto-save stake transaction to history
      try {
        if (publicKey) {
          const walletAddress = publicKey.toString();

          // For stake: amountSOL = 0, amountGOLD = staked amount
          autoSaveTransaction(
            walletAddress,
            txId,
            'stake',
            0, // No SOL involved in staking
            amount, // GOLD amount staked
            'success'
          );
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
                onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${txId}`, '_blank')}
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ),
      });

      // Refresh balances after successful stake
      setTimeout(() => refetch(), 2000);
      
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

  const handleUnstake = async () => {
    if (!connected || !wallet || !unstakeAmount) {
      toast({
        title: "Connection Error",
        description: "Please connect your wallet first",
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
      
      const txId = await solanaService.executeStake(-amount, wallet); // Negative for unstake
      
      setLastTxId(txId);

      // Auto-save unstake transaction to history
      try {
        if (publicKey) {
          const walletAddress = publicKey.toString();

          // For unstake: amountSOL = 0, amountGOLD = unstaked amount
          autoSaveTransaction(
            walletAddress,
            txId,
            'unstake',
            0, // No SOL involved in unstaking
            amount, // GOLD amount unstaked
            'success'
          );
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
                onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${txId}`, '_blank')}
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ),
      });

      setTimeout(() => refetch(), 2000);
      
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

  const handleClaimRewards = async () => {
    if (!connected || !wallet || balances.claimableRewards <= 0) {
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
      
      const txId = await solanaService.executeStake(0, wallet); // Zero amount for claim
      
      setLastTxId(txId);
      
      toast({
        title: "Rewards Claimed! 💰",
        description: (
          <div className="space-y-2">
            <p>Your rewards have been claimed!</p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${txId}`, '_blank')}
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ),
      });
      
      setTimeout(() => refetch(), 2000);
      
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{STAKING_APY}%</p>
            <p className="text-sm text-galaxy-accent">Annual APY</p>
          </CardContent>
        </Card>
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-gold-primary/50 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gold-primary">
              {balances.stakedGold.toFixed(2)}
            </p>
            <p className="text-sm text-galaxy-accent">GOLD Staked</p>
          </CardContent>
        </Card>
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-galaxy-blue/50 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-galaxy-blue">
              {balances.claimableRewards.toFixed(4)}
            </p>
            <p className="text-sm text-galaxy-accent">Claimable Rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake */}
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-green-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-galaxy-bright mb-4 flex items-center">
              <span className="mr-2 text-green-400">🔒</span>
              Stake GOLD
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-galaxy-bright mb-2 block">Amount to Stake</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-background border-galaxy-purple/30 focus:border-green-400 text-galaxy-bright"
                />
                <p className="text-xs text-galaxy-accent mt-1">
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
          </CardContent>
        </Card>

        {/* Unstake */}
        <Card className="bg-galaxy-card border-galaxy-purple/30 hover:border-red-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-galaxy-bright mb-4 flex items-center">
              <span className="mr-2 text-red-400">🔓</span>
              Unstake GOLD
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-galaxy-bright mb-2 block">Amount to Unstake</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="bg-background border-galaxy-purple/30 focus:border-red-400 text-galaxy-bright"
                />
                <p className="text-xs text-galaxy-accent mt-1">
                  Staked: {balances.stakedGold.toFixed(4)} GOLD
                </p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-3 font-medium text-white"
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
      <Card className="bg-galaxy-card border-gold-primary/50 hover:border-gold-primary transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-galaxy-bright">Claimable Rewards</h3>
              <p className="text-2xl font-bold text-gold-primary mt-1">
                {balances.claimableRewards.toFixed(4)} GOLD
              </p>
              <p className="text-sm text-galaxy-accent">
                ≈ ${(balances.claimableRewards * 20).toFixed(2)} USD
              </p>
            </div>
            <Button
              className="bg-gold-gradient hover:from-gold-secondary hover:to-yellow-600 px-6 py-3 font-semibold text-black transition-all duration-200"
              onClick={handleClaimRewards}
              disabled={!connected || balances.claimableRewards <= 0 || isStaking}
            >
              {isStaking ? 'Claiming...' : 'Claim Rewards'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
