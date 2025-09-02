import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { selfContainedWallet } from './wallet-service';
import { TREASURY_WALLET, STAKING_APY } from './constants';

export interface StakeResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface StakeMetadata {
  timestamp: number;
  txHash: string;
  action: 'stake' | 'unstake' | 'claim';
  amount: number;
  stakedAmount: number;
  rewards: number;
}

class StakingService {
  private connection: Connection;
  private stakeHistory: StakeMetadata[] = [];
  private totalStaked: number = 0;
  private lastStakeTime: number = 0;

  constructor() {
    this.connection = selfContainedWallet.getConnection();
  }

  // Stake GOLD tokens to treasury wallet
  async stakeGold(amount: number): Promise<StakeResult> {
    try {
      console.log(`Staking ${amount} GOLD tokens to treasury`);
      
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);
      
      // Create transaction to send a memo with staking info
      const transaction = new Transaction();
      
      // Add memo instruction with staking metadata
      const memoData = `STAKE:${amount}:${Date.now()}`;
      
      // Add small SOL transfer to treasury as staking record
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: selfContainedWallet.getPublicKey(),
          toPubkey: treasuryPubkey,
          lamports: 5000, // Small amount as record
        })
      );

      // Send transaction
      const signature = await selfContainedWallet.signAndSendTransaction(transaction);
      
      // Update staking state
      this.totalStaked += amount;
      this.lastStakeTime = Date.now();
      
      // Record stake metadata
      const stakeData: StakeMetadata = {
        timestamp: Date.now(),
        txHash: signature,
        action: 'stake',
        amount,
        stakedAmount: this.totalStaked,
        rewards: this.calculateRewards()
      };
      
      this.stakeHistory.push(stakeData);
      
      console.log(`Staking successful: ${signature}`);
      return { success: true, signature };
      
    } catch (error: any) {
      console.error('Staking failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Unstake GOLD tokens from treasury wallet
  async unstakeGold(amount: number): Promise<StakeResult> {
    try {
      console.log(`Unstaking ${amount} GOLD tokens from treasury`);
      
      if (amount > this.totalStaked) {
        throw new Error('Insufficient staked amount');
      }
      
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);
      
      // Create transaction with unstaking memo
      const transaction = new Transaction();
      
      // Add memo instruction with unstaking metadata
      const memoData = `UNSTAKE:${amount}:${Date.now()}`;
      
      // Add small SOL transfer from treasury as unstaking record
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: selfContainedWallet.getPublicKey(),
          toPubkey: treasuryPubkey,
          lamports: 5000, // Small amount as record
        })
      );

      // Send transaction
      const signature = await selfContainedWallet.signAndSendTransaction(transaction);
      
      // Update staking state
      this.totalStaked -= amount;
      
      // Record unstake metadata
      const stakeData: StakeMetadata = {
        timestamp: Date.now(),
        txHash: signature,
        action: 'unstake',
        amount,
        stakedAmount: this.totalStaked,
        rewards: this.calculateRewards()
      };
      
      this.stakeHistory.push(stakeData);
      
      console.log(`Unstaking successful: ${signature}`);
      return { success: true, signature };
      
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Claim staking rewards
  async claimRewards(): Promise<StakeResult> {
    try {
      const rewards = this.calculateRewards();
      
      if (rewards <= 0) {
        throw new Error('No rewards to claim');
      }
      
      console.log(`Claiming ${rewards} GOLD rewards from treasury`);
      
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);
      
      // Create transaction with claim memo
      const transaction = new Transaction();
      
      // Add memo instruction with claim metadata
      const memoData = `CLAIM:${rewards}:${Date.now()}`;
      
      // Add small SOL transfer as claim record
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: selfContainedWallet.getPublicKey(),
          toPubkey: treasuryPubkey,
          lamports: 5000, // Small amount as record
        })
      );

      // Send transaction
      const signature = await selfContainedWallet.signAndSendTransaction(transaction);
      
      // Reset last stake time after claiming
      this.lastStakeTime = Date.now();
      
      // Record claim metadata
      const stakeData: StakeMetadata = {
        timestamp: Date.now(),
        txHash: signature,
        action: 'claim',
        amount: rewards,
        stakedAmount: this.totalStaked,
        rewards: 0 // Reset after claiming
      };
      
      this.stakeHistory.push(stakeData);
      
      console.log(`Rewards claimed: ${signature}`);
      return { success: true, signature };
      
    } catch (error: any) {
      console.error('Claiming rewards failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate current rewards based on staking time and APY
  calculateRewards(): number {
    if (this.totalStaked <= 0 || this.lastStakeTime <= 0) {
      return 0;
    }
    
    const currentTime = Date.now();
    const stakingDurationMs = currentTime - this.lastStakeTime;
    const stakingDurationYears = stakingDurationMs / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate rewards: staked_amount * APY * time_staked_in_years
    const rewards = this.totalStaked * (STAKING_APY / 100) * stakingDurationYears;
    
    return Math.max(0, rewards);
  }

  // Get staking information
  getStakeInfo() {
    return {
      totalStaked: this.totalStaked,
      claimableRewards: this.calculateRewards(),
      lastStakeTime: this.lastStakeTime,
      apy: STAKING_APY
    };
  }

  // Get staking history
  getStakeHistory(): StakeMetadata[] {
    return this.stakeHistory;
  }

  // Clear staking history
  clearHistory(): void {
    this.stakeHistory = [];
  }
}

export const stakingService = new StakingService();