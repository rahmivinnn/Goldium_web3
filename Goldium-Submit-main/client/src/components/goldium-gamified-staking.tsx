import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/components/solana-wallet-provider';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, Flame, Star, Trophy } from 'lucide-react';

interface StakingData {
  amount: number;
  startTime: number;
  rewards: number;
  stage: number;
}

interface StageInfo {
  name: string;
  minDays: number;
  apy: number;
  icon: string;
  description: string;
  color: string;
}

const STAKING_STAGES: StageInfo[] = [
  {
    name: "Golden Egg",
    minDays: 0,
    apy: 10,
    icon: "/assets/golden-egg.svg",
    description: "Your GOLD is incubating...",
    color: "from-yellow-400 to-yellow-600"
  },
  {
    name: "Cracked Egg",
    minDays: 7,
    apy: 12,
    icon: "/assets/cracked-egg.svg",
    description: "Something is stirring inside!",
    color: "from-orange-400 to-yellow-500"
  },
  {
    name: "Baby Dragon",
    minDays: 30,
    apy: 15,
    icon: "/assets/baby-dragon.svg",
    description: "Your dragon has hatched!",
    color: "from-red-400 to-orange-500"
  },
  {
    name: "Golden Dragon",
    minDays: 90,
    apy: 20,
    icon: "/assets/full-dragon.svg",
    description: "Legendary Golden Dragon!",
    color: "from-yellow-300 to-amber-500"
  }
];

const GoldiumGamifiedStaking: React.FC = () => {
  const { connected, publicKey } = useSolanaWallet();
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<StageInfo>(STAKING_STAGES[0]);
  const [stakingDays, setStakingDays] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showDragon, setShowDragon] = useState<boolean>(true); // Always show dragon

  // Mock connection for demo purposes
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  useEffect(() => {
    if (connected && publicKey) {
      fetchGoldBalance();
      loadStakingData();
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (stakingData) {
      const interval = setInterval(() => {
        updateStakingProgress();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stakingData]);

  const fetchGoldBalance = async () => {
    if (!publicKey) return;
    
    try {
      // Real GOLD balance - fetch SPL token balance from Solana
      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      
      // GOLD token mint address
      const GOLD_MINT = new PublicKey('GLD1111111111111111111111111111111111111111');
      
      // Get user's GOLD token account
      const userTokenAccount = await getAssociatedTokenAddress(
        GOLD_MINT,
        publicKey
      );
      
      // Get token account info
      const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount);
      
      if (tokenAccountInfo.value) {
        const balance = parseFloat(tokenAccountInfo.value.amount) / Math.pow(10, tokenAccountInfo.value.decimals);
        setGoldBalance(balance);
      } else {
        setGoldBalance(0);
      }
    } catch (error) {
      console.error('Error fetching GOLD balance:', error);
      // Fallback to 0 if token account doesn't exist or other error
      setGoldBalance(0);
    }
  };

  const loadStakingData = () => {
    // Load from localStorage for demo
    const saved = localStorage.getItem(`staking_${publicKey?.toString()}`);
    if (saved) {
      const data = JSON.parse(saved);
      setStakingData(data);
      updateStakingProgress(data);
    }
  };

  const saveStakingData = (data: StakingData) => {
    localStorage.setItem(`staking_${publicKey?.toString()}`, JSON.stringify(data));
  };

  const updateStakingProgress = (data?: StakingData) => {
    const currentData = data || stakingData;
    if (!currentData) return;

    const now = Date.now();
    const elapsed = now - currentData.startTime;
    const days = elapsed / (1000 * 60 * 60 * 24);
    setStakingDays(days);

    // Calculate rewards
    const stage = getCurrentStage(days);
    setCurrentStage(stage);
    
    const yearlyRewards = (currentData.amount * stage.apy) / 100;
    const dailyRewards = yearlyRewards / 365;
    const totalRewards = dailyRewards * days;
    
    const updatedData = { ...currentData, rewards: totalRewards };
    setStakingData(updatedData);
    saveStakingData(updatedData);

    // Progress to next stage
    const nextStage = STAKING_STAGES.find(s => s.minDays > days);
    if (nextStage) {
      const progressToNext = ((days - stage.minDays) / (nextStage.minDays - stage.minDays)) * 100;
      setProgress(Math.min(progressToNext, 100));
    } else {
      setProgress(100);
    }
  };

  const getCurrentStage = (days: number): StageInfo => {
    for (let i = STAKING_STAGES.length - 1; i >= 0; i--) {
      if (days >= STAKING_STAGES[i].minDays) {
        return STAKING_STAGES[i];
      }
    }
    return STAKING_STAGES[0];
  };

  const handleStake = async () => {
    if (!stakeAmount || !connected || !publicKey) return;
    
    setLoading(true);
    try {
      const amount = parseFloat(stakeAmount);
      if (amount > goldBalance) {
        alert('Insufficient GOLD balance');
        return;
      }

      // Real Solana transaction for staking GOLD
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
      
      // GOLD token mint address (replace with actual GOLD token mint)
      const GOLD_MINT = new PublicKey('GLD1111111111111111111111111111111111111111'); // Replace with real GOLD mint
      
      // Get user's GOLD token account
      const userTokenAccount = await getAssociatedTokenAddress(
        GOLD_MINT,
        publicKey
      );
      
      // Staking program account (replace with actual staking program)
      const stakingProgram = new PublicKey('STK1111111111111111111111111111111111111111'); // Replace with real staking program
      
      const transaction = new Transaction();
      
      // Add transfer instruction to move GOLD tokens to staking program
      transaction.add(
        createTransferInstruction(
          userTokenAccount,
          stakingProgram,
          publicKey,
          amount * LAMPORTS_PER_SOL // Convert to lamports
        )
      );
      
      // Get wallet adapter for signing
      const wallet = (window as any).solana;
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      const newStakingData: StakingData = {
        amount: stakingData ? stakingData.amount + amount : amount,
        startTime: stakingData?.startTime || Date.now(),
        rewards: stakingData?.rewards || 0,
        stage: 0
      };
      
      setStakingData(newStakingData);
      saveStakingData(newStakingData);
      setGoldBalance(prev => prev - amount);
      setStakeAmount('');
      
      alert(`Successfully staked ${amount} GOLD! Transaction: ${signature}`);
    } catch (error) {
      console.error('Staking error:', error);
      alert(`Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!stakingData || !connected || !publicKey) return;
    
    setLoading(true);
    try {
      // Real Solana transaction for unstaking GOLD
      const { Transaction, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const { getAssociatedTokenAddress, createTransferInstruction } = await import('@solana/spl-token');
      
      // GOLD token mint address
      const GOLD_MINT = new PublicKey('GLD1111111111111111111111111111111111111111');
      
      // Get user's GOLD token account
      const userTokenAccount = await getAssociatedTokenAddress(
        GOLD_MINT,
        publicKey
      );
      
      // Staking program account
      const stakingProgram = new PublicKey('STK1111111111111111111111111111111111111111');
      
      const transaction = new Transaction();
      const totalReturn = stakingData.amount + stakingData.rewards;
      
      // Add transfer instruction to return GOLD tokens from staking program
      transaction.add(
        createTransferInstruction(
          stakingProgram,
          userTokenAccount,
          publicKey, // Authority (should be staking program in real implementation)
          totalReturn * LAMPORTS_PER_SOL
        )
      );
      
      // Get wallet adapter for signing
      const wallet = (window as any).solana;
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      setGoldBalance(prev => prev + totalReturn);
      setStakingData(null);
      localStorage.removeItem(`staking_${publicKey?.toString()}`);
      
      alert(`Successfully unstaked! Received ${totalReturn.toFixed(4)} GOLD. Transaction: ${signature}`);
    } catch (error) {
      console.error('Unstaking error:', error);
      alert(`Unstaking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!stakingData || stakingData.rewards === 0 || !connected || !publicKey) return;
    
    setLoading(true);
    try {
      // Real Solana transaction for claiming rewards
      const { Transaction, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const { getAssociatedTokenAddress, createTransferInstruction } = await import('@solana/spl-token');
      
      // GOLD token mint address
      const GOLD_MINT = new PublicKey('GLD1111111111111111111111111111111111111111');
      
      // Get user's GOLD token account
      const userTokenAccount = await getAssociatedTokenAddress(
        GOLD_MINT,
        publicKey
      );
      
      // Staking program account
      const stakingProgram = new PublicKey('STK1111111111111111111111111111111111111111');
      
      const transaction = new Transaction();
      
      // Add transfer instruction to claim rewards
      transaction.add(
        createTransferInstruction(
          stakingProgram,
          userTokenAccount,
          publicKey, // Authority (should be staking program in real implementation)
          stakingData.rewards * LAMPORTS_PER_SOL
        )
      );
      
      // Get wallet adapter for signing
      const wallet = (window as any).solana;
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      setGoldBalance(prev => prev + stakingData.rewards);
      const claimedAmount = stakingData.rewards;
      const updatedData = { ...stakingData, rewards: 0 };
      setStakingData(updatedData);
      saveStakingData(updatedData);
      
      alert(`Successfully claimed ${claimedAmount.toFixed(4)} GOLD rewards! Transaction: ${signature}`);
    } catch (error) {
      console.error('Claim error:', error);
      alert(`Claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Removed wallet connection requirement - dragon evolution always visible

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Goldium Gamified Staking
          </CardTitle>
          <p className="text-yellow-100">Stake GOLD and watch your dragon evolve!</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dragon Evolution Display */}
        <Card className="relative overflow-hidden bg-black border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5" />
              Dragon Evolution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center bg-black">
            <div className="space-y-4">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${stakingData ? currentStage.color : 'from-yellow-400 to-yellow-600'} flex items-center justify-center animate-pulse shadow-lg p-2`}>
                {stakingData ? (
                  <img 
                    src={currentStage.icon} 
                    alt={currentStage.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-4xl text-white">🥚</div>
                )}
              </div>
              <div>
                <Badge className={`bg-gradient-to-r ${stakingData ? currentStage.color : 'from-yellow-400 to-yellow-600'} text-white`}>
                  {stakingData ? currentStage.name : 'Golden Egg'}
                </Badge>
                <p className="text-sm text-gray-300 mt-2">
                  {stakingData ? currentStage.description : 'Your GOLD is ready to be staked...'}
                </p>
                <p className="text-xs text-gray-400">
                  APY: {stakingData ? currentStage.apy : STAKING_STAGES[0].apy}%
                </p>
              </div>
              
              {/* Progress to next stage */}
              {stakingData && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white">
                    <span>Days Staked: {stakingDays.toFixed(1)}</span>
                    <span>Next Stage: {STAKING_STAGES.find(s => s.minDays > stakingDays)?.name || 'Max Level'}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {!stakingData && (
                <div className="text-center">
                  <p className="text-white text-sm">🐉 Start staking to begin your dragon evolution journey!</p>
                  <p className="text-yellow-300 text-xs mt-1">Your dragon awaits...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staking Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Staking Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Balances */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-gray-600 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 text-gray-400">💰</div>
                  <p className="text-sm text-gray-300">Wallet Balance</p>
                </div>
                <p className="font-bold text-white">0.0000 GOLD</p>
              </div>
              <div className="bg-black border border-gray-600 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 text-gray-400">🔒</div>
                  <p className="text-sm text-gray-300">Staked Amount</p>
                </div>
                <p className="font-bold text-white">{stakingData?.amount.toFixed(4) || '0.0000'} GOLD</p>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-black border border-gray-600 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 text-gray-400">🎁</div>
                <p className="text-sm text-gray-300">Pending Rewards</p>
              </div>
              <p className="font-bold text-white flex items-center gap-1">
                <Flame className="w-4 h-4 text-gray-400" />
                {stakingData?.rewards.toFixed(6) || '0.000000'} GOLD
              </p>
            </div>

            {/* Actions */}
            {!stakingData ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Amount to stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  max={goldBalance}
                />
                <Button 
                  onClick={handleStake} 
                  disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                >
                  {loading ? 'Staking...' : 'Start Staking'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleClaimRewards} 
                    disabled={loading || !stakingData.rewards || stakingData.rewards === 0}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? 'Claiming...' : 'Claim Rewards'}
                  </Button>
                  <Button 
                    onClick={handleUnstake} 
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                  >
                    {loading ? 'Unstaking...' : 'Unstake All'}
                  </Button>
                </div>
                
                {/* Additional staking */}
                <div className="border-t pt-3 space-y-2">
                  <Input
                    type="number"
                    placeholder="Add more GOLD"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    max={goldBalance}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleStake} 
                    disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    {loading ? 'Adding...' : 'Add to Stake'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stages Info */}
      <Card>
        <CardHeader>
          <CardTitle>Evolution Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STAKING_STAGES.map((stage, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 transition-all backdrop-blur-sm ${
                  currentStage.name === stage.name 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/80 to-amber-800/80 shadow-lg shadow-yellow-400/20' 
                    : 'border-gray-600/50 bg-gradient-to-br from-gray-900/60 to-gray-800/60 hover:border-gray-500/70'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto relative">
                    <div className={`absolute inset-0 rounded-full ${
                      currentStage.name === stage.name 
                        ? 'bg-gradient-to-br from-yellow-400/20 to-amber-500/20 animate-pulse' 
                        : 'bg-gradient-to-br from-gray-600/20 to-gray-700/20'
                    }`}></div>
                    <img 
                      src={stage.icon} 
                      alt={stage.name}
                      className="w-full h-full object-contain relative z-10"
                    />
                  </div>
                  <h4 className={`font-bold text-sm ${
                    currentStage.name === stage.name ? 'text-yellow-200' : 'text-gray-200'
                  }`}>{stage.name}</h4>
                  <p className={`text-xs ${
                    currentStage.name === stage.name ? 'text-yellow-300' : 'text-gray-400'
                  }`}>{stage.minDays}+ days</p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      currentStage.name === stage.name 
                        ? 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30' 
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/30'
                    }`}
                  >
                    ⚡ {stage.apy}% APY
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoldiumGamifiedStaking;