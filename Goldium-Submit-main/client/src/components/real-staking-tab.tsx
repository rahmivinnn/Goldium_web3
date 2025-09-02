import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useInstantBalance } from '@/hooks/use-instant-balance';
import { useToast } from '@/hooks/use-toast';
import { solscanTracker } from '@/lib/solscan-tracker';
import { STAKING_APY, SOLSCAN_BASE_URL } from '@/lib/constants';
import { realStakingService } from '@/lib/real-staking-service';
import { GoldTokenService } from '@/services/gold-token-service';

export function RealStakingTab() {
  const wallet = useExternalWallets();
  const instantBalance = useInstantBalance();
  const { toast } = useToast();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  // Get REAL staking info from connected wallet
  const stakingInfo = wallet.connected && wallet.address ? realStakingService.getStakingInfo(wallet.address) : [];
  const totalStaked = wallet.connected && wallet.address ? realStakingService.getTotalStaked(wallet.address) : 0;
  const pendingRewards = wallet.connected && wallet.address ? realStakingService.calculateRewards(wallet.address) : 0;

  // REAL stake using actual SOL from wallet
  const handleStake = async () => {
    if (!wallet.connected || !stakeAmount) {
      toast({
        title: "Invalid Input",
        description: "Please connect wallet and enter an amount to stake",
        variant: "destructive"
      });
      return;
    }

    // Use precise calculation to avoid floating point issues
    const amount = Math.floor(Number(stakeAmount) * 1000000) / 1000000;
    const availableBalance = instantBalance.balance;
    const feeBuffer = 0.001; // Reserve for transaction fees
    
    if (amount <= 0 || (amount + feeBuffer) > availableBalance) {
      toast({
        title: "Invalid Amount", 
        description: availableBalance === 0 ? 
          "You need SOL to stake. Your wallet balance is 0." :
          `Please enter a valid amount (max: ${(availableBalance - feeBuffer).toFixed(6)} SOL)`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    
    try {
      console.log(`Executing REAL stake: ${amount} SOL from wallet ${wallet.address}`);
      
      // Get wallet instance for REAL transaction
      const walletInstance = (window as any).phantom?.solana || (window as any).solflare || (window as any).trustwallet?.solana;
      if (!walletInstance) {
        throw new Error('Wallet not found');
      }

      if (!wallet.address) {
        throw new Error('Wallet address not found');
      }

      const result = await realStakingService.stakeSOL(amount, wallet.address, walletInstance);
      
      if (result.success && result.signature) {
        setLastTxId(result.signature);
        setStakeAmount('');
        
        // Track transaction for Solscan
        solscanTracker.trackTransaction({
          signature: result.signature,
          type: 'stake',
          token: 'SOL',
          amount
        });
        
        console.log('🔗 Staking Transaction on Solscan:', solscanTracker.getSolscanUrl(result.signature));
        
        toast({
          title: "Staking Successful! 🔒",
          description: (
            <div className="space-y-2">
              <p>Your SOL has been staked successfully!</p>
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
        
      } else {
        throw new Error(result.error || 'Staking failed');
      }
      
    } catch (error: any) {
      console.error('REAL stake failed:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  // REAL unstake
  const handleUnstake = async () => {
    if (!wallet.connected || !unstakeAmount) {
      toast({
        title: "Invalid Input",
        description: "Please connect wallet and enter an amount to unstake",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(unstakeAmount);
    if (amount <= 0 || amount > totalStaked) {
      toast({
        title: "Invalid Amount",
        description: totalStaked === 0 ? 
          "You have no staked SOL to unstake." :
          `Please enter a valid amount (max: ${totalStaked.toFixed(6)} SOL)`,
        variant: "destructive"
      });
      return;
    }

    setIsUnstaking(true);
    
    try {
      console.log(`Executing REAL unstake: ${amount} SOL for wallet ${wallet.address}`);
      
      // Get wallet instance
      const walletInstance = (window as any).phantom?.solana || (window as any).solflare || (window as any).trustwallet?.solana;
      
      if (!wallet.address) {
        throw new Error('Wallet address not found');
      }
      
      const result = await realStakingService.unstakeSOL(amount, wallet.address, walletInstance);
      
      if (result.success && result.signature) {
        setLastTxId(result.signature);
        setUnstakeAmount('');
        
        toast({
          title: "Unstaking Successful! 🔓",
          description: `Successfully unstaked ${amount} SOL`,
        });
        
      } else {
        throw new Error(result.error || 'Unstaking failed');
      }
      
    } catch (error: any) {
      console.error('REAL unstake failed:', error);
      toast({
        title: "Unstaking Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Staking Overview */}
      <Card className="bg-gradient-to-br from-galaxy-purple/10 to-galaxy-accent/5 border-galaxy-purple/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-galaxy-bright">SOL Staking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-galaxy-muted">Total Staked</p>
                <p className="text-xl font-bold text-galaxy-bright">
                  {totalStaked.toFixed(6)} SOL
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-galaxy-muted">Pending Rewards</p>
                <p className="text-xl font-bold text-galaxy-accent">
                  {pendingRewards.toFixed(6)} SOL
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-galaxy-purple/20">
              <p className="text-sm text-galaxy-muted">
                APY: <span className="text-galaxy-accent font-semibold">{STAKING_APY}%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Balance */}
      <Card className="bg-galaxy-card border-galaxy-purple/20">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-galaxy-muted">Available to Stake</p>
            <p className="text-2xl font-bold text-galaxy-bright">
              {instantBalance.balance.toFixed(6)} SOL
            </p>
            {wallet.connected && wallet.address && (
              <p className="text-xs text-galaxy-muted">
                {wallet.selectedWallet} - {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stake SOL */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-galaxy-bright">Stake SOL</h4>
        <div className="space-y-3">
          <div className="relative">
            <Input
              type="number"
              placeholder="Enter SOL amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-yellow-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
              step="0.000001"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (wallet.connected) {
                  // Leave 0.001 SOL for transaction fees and round to avoid precision issues
                  const maxAmount = Math.max(0, Math.floor((instantBalance.balance - 0.001) * 1000000) / 1000000);
                  setStakeAmount(maxAmount.toFixed(6));
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-galaxy-accent hover:text-galaxy-bright"
            >
              MAX
            </Button>
          </div>
          <Button
            onClick={handleStake}
            disabled={!wallet.connected || !stakeAmount || isStaking || Number(stakeAmount) <= 0}
            className="w-full bg-galaxy-accent hover:bg-galaxy-accent/80 text-white font-semibold"
          >
            {isStaking ? 'Staking...' : 'Stake SOL'}
          </Button>
        </div>
      </div>

      {/* Unstake SOL */}
      {totalStaked > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-galaxy-bright">Unstake SOL</h4>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter SOL amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-yellow-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
                step="0.000001"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnstakeAmount(totalStaked.toString())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-galaxy-accent hover:text-galaxy-bright"
              >
                MAX
              </Button>
            </div>
            <Button
              onClick={handleUnstake}
              disabled={!wallet.connected || !unstakeAmount || isUnstaking || Number(unstakeAmount) <= 0}
              className="w-full bg-galaxy-purple hover:bg-galaxy-purple/80 text-white font-semibold"
            >
              {isUnstaking ? 'Unstaking...' : 'Unstake SOL'}
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!wallet.connected && (
        <div className="text-center">
          <p className="text-sm text-galaxy-muted">
            Connect your wallet to start staking SOL
          </p>
        </div>
      )}

      {/* Last Transaction */}
      {lastTxId && (
        <Card className="bg-galaxy-card border-galaxy-purple/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-galaxy-muted">Last Transaction</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${SOLSCAN_BASE_URL}/tx/${lastTxId}`, '_blank')}
                className="text-galaxy-accent hover:text-galaxy-bright"
              >
                View <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}