import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { solscanTracker } from '@/lib/solscan-tracker';
import { useGoldBalance } from '@/hooks/use-gold-balance';
import { Lock, Unlock, TrendingUp, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logoImage from '@assets/k1xiYLna_400x400-removebg-preview_1754140723127.png';

export function GoldStakingTab() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const { toast } = useToast();
  const goldBalance = useGoldBalance();

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return;
    }

    if (amount > goldBalance.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${goldBalance.balance.toFixed(4)} GOLD available`,
        variant: "destructive",
      });
      return;
    }

    if (amount < goldBalance.stakingInfo.minStake) {
      toast({
        title: "Amount Too Low",
        description: `Minimum stake amount is ${goldBalance.stakingInfo.minStake} GOLD`,
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    try {
      const signature = await goldBalance.stakeGold(amount);
      
      // Track transaction for Solscan
      solscanTracker.trackTransaction({
        signature,
        type: 'stake',
        token: 'GOLD',
        amount
      });
      
      solscanTracker.showContractInfo('GOLD');
      
      toast({
        title: "Staking Successful!",
        description: `Staked ${amount} GOLD. Transaction: ${signature.slice(0, 8)}...`,
      });
      
      console.log('🔗 GOLD Staking Transaction on Solscan:', solscanTracker.getSolscanUrl(signature));

      setStakeAmount('');
      
    } catch (error: any) {
      console.error('GOLD staking failed:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake GOLD tokens",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to unstake",
        variant: "destructive",
      });
      return;
    }

    if (amount > goldBalance.stakedBalance) {
      toast({
        title: "Insufficient Staked Balance",
        description: `You only have ${goldBalance.stakedBalance.toFixed(4)} GOLD staked`,
        variant: "destructive",
      });
      return;
    }

    setIsUnstaking(true);
    try {
      const signature = await goldBalance.unstakeGold(amount);
      
      // Track transaction for Solscan
      solscanTracker.trackTransaction({
        signature,
        type: 'unstake',
        token: 'GOLD',
        amount
      });
      
      solscanTracker.showContractInfo('GOLD');
      
      toast({
        title: "Unstaking Successful!",
        description: `Unstaked ${amount} GOLD. Transaction: ${signature.slice(0, 8)}...`,
      });
      
      console.log('🔗 GOLD Unstaking Transaction on Solscan:', solscanTracker.getSolscanUrl(signature));

      setUnstakeAmount('');
      
    } catch (error: any) {
      console.error('GOLD unstaking failed:', error);
      toast({
        title: "Unstaking Failed",
        description: error.message || "Failed to unstake GOLD tokens",
        variant: "destructive",
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  const maxStake = () => {
    setStakeAmount(goldBalance.balance.toString());
  };

  const maxUnstake = () => {
    setUnstakeAmount(goldBalance.stakedBalance.toString());
  };

  const projectedRewards = goldBalance.stakedBalance * (goldBalance.stakingInfo.apy / 100);

  return (
    <Card className="bg-galaxy-card border-galaxy-purple/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-galaxy-bright">
          <img 
            src={logoImage} 
            alt="GOLD" 
            className="w-6 h-6"
          />
          GOLD Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Staking Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-galaxy-purple/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-galaxy-text text-sm">APY</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {goldBalance.stakingInfo.apy}%
            </div>
          </div>

          <div className="bg-galaxy-purple/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-galaxy-blue" />
              <span className="text-galaxy-text text-sm">Staked</span>
            </div>
            <div className="text-2xl font-bold text-galaxy-bright">
              {goldBalance.stakedBalance.toFixed(4)}
            </div>
            <div className="text-xs text-galaxy-accent">
              ${(goldBalance.stakedBalance * 20).toFixed(2)} USD
            </div>
          </div>

          <div className="bg-galaxy-purple/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-galaxy-yellow" />
              <span className="text-galaxy-text text-sm">Yearly Rewards</span>
            </div>
            <div className="text-2xl font-bold text-galaxy-yellow">
              {projectedRewards.toFixed(4)}
            </div>
            <div className="text-xs text-galaxy-accent">
              ${(projectedRewards * 20).toFixed(2)} USD
            </div>
          </div>
        </div>

        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-galaxy-secondary">
            <TabsTrigger value="stake" className="data-[state=active]:bg-galaxy-purple/50">
              Stake
            </TabsTrigger>
            <TabsTrigger value="unstake" className="data-[state=active]:bg-galaxy-purple/50">
              Unstake
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4 mt-6">
            {/* Available Balance */}
            <div className="bg-galaxy-purple/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-galaxy-text">Available to Stake:</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-galaxy-bright">
                    {goldBalance.balance.toFixed(4)} GOLD
                  </div>
                  <div className="text-sm text-galaxy-accent">
                    ≈ ${(goldBalance.balance * 20).toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Stake Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="stakeAmount" className="text-galaxy-bright">
                Amount to Stake (GOLD)
              </Label>
              <div className="relative">
                <Input
                  id="stakeAmount"
                  type="number"
                  placeholder="0.0000"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-yellow-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
                  step="0.0001"
                  min={goldBalance.stakingInfo.minStake}
                  max={goldBalance.balance}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={maxStake}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-galaxy-blue hover:text-galaxy-bright"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || goldBalance.balance === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold"
            >
              {isStaking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Staking...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Stake GOLD
                </div>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4 mt-6">
            {/* Staked Balance */}
            <div className="bg-galaxy-purple/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-galaxy-text">Staked Balance:</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-galaxy-bright">
                    {goldBalance.stakedBalance.toFixed(4)} GOLD
                  </div>
                  <div className="text-sm text-galaxy-accent">
                    ≈ ${(goldBalance.stakedBalance * 20).toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Unstake Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="unstakeAmount" className="text-galaxy-bright">
                Amount to Unstake (GOLD)
              </Label>
              <div className="relative">
                <Input
                  id="unstakeAmount"
                  type="number"
                  placeholder="0.0000"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-yellow-400/30 text-white placeholder:text-gray-400 pr-16 backdrop-blur-sm"
                  step="0.0001"
                  min="0"
                  max={goldBalance.stakedBalance}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={maxUnstake}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-galaxy-blue hover:text-galaxy-bright"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Lock Period Warning */}
            <Alert className="border-orange-500/30 bg-orange-500/10">
              <Calendar className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-200">
                Unstaking has a {goldBalance.stakingInfo.lockPeriod} day cooldown period. Your tokens will be available after this period.
              </AlertDescription>
            </Alert>

            {/* Unstake Button */}
            <Button
              onClick={handleUnstake}
              disabled={isUnstaking || !unstakeAmount || goldBalance.stakedBalance === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold"
            >
              {isUnstaking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Unstaking...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Unstake GOLD
                </div>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Staking Info */}
        <div className="text-xs text-galaxy-text space-y-1 pt-4 border-t border-galaxy-purple/30">
          <div className="flex justify-between">
            <span>Minimum Stake:</span>
            <span className="text-galaxy-accent">{goldBalance.stakingInfo.minStake} GOLD</span>
          </div>
          <div className="flex justify-between">
            <span>Lock Period:</span>
            <span className="text-galaxy-accent">{goldBalance.stakingInfo.lockPeriod} days</span>
          </div>
          <div className="flex justify-between">
            <span>Rewards Distribution:</span>
            <span className="text-galaxy-accent">Daily</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}